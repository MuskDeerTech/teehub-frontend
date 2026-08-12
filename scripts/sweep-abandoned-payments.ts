/**
 * Resolves online orders that were left hanging at "pending".
 *
 * An online order row is written before the customer reaches HDFC's payment
 * page, because the gateway needs an order id and amount to bill against. If
 * they close the tab, neither of the two things that normally settle an order
 * ever happens: the return page only runs if they come back, and the webhook
 * only fires if a payment was attempted. The row then sits at "pending"
 * forever — cluttering the admin list and showing the customer a phantom order
 * in their history.
 *
 * This pass asks the gateway what actually happened to each stale order:
 *
 *   paid    -> confirm it and send the receipt that was never sent. This is the
 *              customer who paid and then lost their connection: we have their
 *              money and they have nothing, and nobody currently knows.
 *   failed  -> cancel it, so it lands in the customer's Cancelled tab.
 *   pending -> leave it alone until it passes the expiry window, then cancel.
 *              Someone may still be typing an OTP.
 *
 * Run it on a schedule (cron, every 15 minutes):
 *   cd /path/to/teehub && npm run sweep:payments >> logs/sweep.log 2>&1
 *
 * Use --dry-run first: it performs no writes at all, and reports what it would
 * have done to each order.
 */
import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import type { Order } from "../payload-types";
import {
  HDFC_PAID_STATUS,
  HDFC_PENDING_STATUSES,
  HdfcGatewayError,
  getHdfcOrderStatus,
  hdfcCustomerId,
  verifyHdfcStatus,
} from "../src/lib/payments/hdfc";
import { reconcileHdfcOrder } from "../src/lib/payments/reconcileHdfc";
import { sendOrderEmails } from "../src/lib/email/orderEmails";

/** Grace period before an order is even looked at. Someone may be mid-payment. */
const SWEEP_AFTER_MINUTES = Number(
  process.env.PAYMENT_SWEEP_AFTER_MINUTES || 30,
);
/** After this, a still-"pending" gateway status is treated as abandoned. */
const EXPIRE_AFTER_HOURS = Number(process.env.PAYMENT_EXPIRE_AFTER_HOURS || 24);
const PAGE_SIZE = 100;

type Outcome =
  | "rescued"
  | "cancelled"
  | "expired"
  | "waiting"
  | "mismatch"
  | "error";

const report: Record<Outcome, number> = {
  rescued: 0,
  cancelled: 0,
  expired: 0,
  waiting: 0,
  mismatch: 0,
  error: 0,
};

function customerIdOf(order: Order) {
  return typeof order.customer === "object" && order.customer
    ? order.customer.id
    : order.customer;
}

function ageHours(order: Order) {
  const created = new Date(order.createdAt).getTime();
  return Number.isNaN(created) ? 0 : (Date.now() - created) / 3_600_000;
}

function label(order: Order) {
  return order.orderNumber ?? `#${order.id}`;
}

/**
 * Stale, unsettled, gateway-backed orders. COD is excluded by construction —
 * it has no gatewayOrderId and is confirmed the moment it is placed.
 */
async function stalePendingOrders(payload: Payload, page: number) {
  const cutoff = new Date(
    Date.now() - SWEEP_AFTER_MINUTES * 60_000,
  ).toISOString();

  return payload.find({
    collection: "orders",
    where: {
      and: [
        { "payment.status": { equals: "pending" } },
        { "payment.gatewayOrderId": { exists: true } },
        { "payment.method": { not_equals: "cod" } },
        { status: { equals: "pending" } },
        { createdAt: { less_than_equal: cutoff } },
      ],
    },
    sort: "createdAt",
    page,
    limit: PAGE_SIZE,
    depth: 0,
    overrideAccess: true,
  });
}

/** Read-only: asks the gateway and reports, without writing anything. */
async function inspect(order: Order) {
  const customerId = customerIdOf(order);
  if (!customerId) return "error" as const;

  const status = await getHdfcOrderStatus(
    order.payment!.gatewayOrderId!,
    hdfcCustomerId(customerId),
  );
  verifyHdfcStatus({
    expectedOrderId: order.payment!.gatewayOrderId!,
    expectedAmount: Number(order.totalPrice ?? 0),
    status,
  });

  if (status.status === HDFC_PAID_STATUS) return "rescued" as const;
  if (HDFC_PENDING_STATUSES.has(status.status)) {
    return ageHours(order) >= EXPIRE_AFTER_HOURS
      ? ("expired" as const)
      : ("waiting" as const);
  }
  return "cancelled" as const;
}

/** Cancels an order the gateway still calls "pending" long past its window. */
async function expire(payload: Payload, order: Order) {
  await payload.update({
    collection: "orders",
    id: order.id,
    overrideAccess: true,
    depth: 0,
    data: {
      status: "cancelled",
      payment: {
        ...order.payment,
        status: "failed",
        verifiedAt: new Date().toISOString(),
      },
    },
  });
}

async function settle(payload: Payload, order: Order, dryRun: boolean) {
  const customerId = customerIdOf(order);
  if (!customerId) {
    console.error(`[sweep] ${label(order)} has no customer; skipped.`);
    return "error" as const;
  }

  if (dryRun) return inspect(order);

  const { updated, paymentState, becamePaid } = await reconcileHdfcOrder(
    payload,
    order,
    customerId,
  );

  if (becamePaid) {
    // The receipt and staff alert that the return page never got to send.
    await sendOrderEmails(payload, updated);
    return "rescued" as const;
  }
  if (paymentState === "failed") return "cancelled" as const;

  if (ageHours(order) >= EXPIRE_AFTER_HOURS) {
    await expire(payload, updated);
    return "expired" as const;
  }
  return "waiting" as const;
}

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  const payload = await getPayload({ config });
  activePayload = payload;

  console.log(
    `[sweep] ${dryRun ? "DRY RUN — no writes. " : ""}Looking at online orders still pending after ${SWEEP_AFTER_MINUTES} minute(s); cancelling those unresolved after ${EXPIRE_AFTER_HOURS} hour(s).`,
  );

  let page = 1;
  let scanned = 0;

  while (true) {
    const result = await stalePendingOrders(payload, page);
    if (result.docs.length === 0) break;

    for (const order of result.docs) {
      scanned += 1;
      try {
        const outcome = await settle(payload, order, dryRun);
        report[outcome] += 1;
        if (outcome !== "waiting") {
          console.log(
            `[sweep] ${label(order)} (${ageHours(order).toFixed(1)}h old, ₹${order.totalPrice ?? 0}) -> ${outcome}`,
          );
        }
      } catch (error) {
        // A 409 means the gateway's amount/merchant did not match ours. Never
        // auto-resolve that — it wants a human.
        if (error instanceof HdfcGatewayError && error.status === 409) {
          report.mismatch += 1;
          console.error(
            `[sweep] ${label(order)} NEEDS REVIEW — gateway details did not match: ${error.message}`,
          );
          continue;
        }
        report.error += 1;
        console.error(
          `[sweep] ${label(order)} failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    // Settled orders drop out of the query, so re-reading page 1 walks the
    // remainder. Only the untouched "waiting" ones keep their place.
    if (!result.hasNextPage) break;
    page = dryRun ? page + 1 : 1;
    if (dryRun && page > (result.totalPages ?? 1)) break;
  }

  console.log(
    `[sweep] Done. Scanned ${scanned}: ${report.rescued} rescued (paid after all), ${report.cancelled} cancelled, ${report.expired} expired, ${report.waiting} still in flight, ${report.mismatch} need review, ${report.error} errored.`,
  );

  if (report.mismatch > 0 || report.error > 0) process.exitCode = 1;
}

let activePayload: Payload | undefined;
const keepAlive = setInterval(() => undefined, 1000);

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await activePayload?.destroy();
    clearInterval(keepAlive);
  });
