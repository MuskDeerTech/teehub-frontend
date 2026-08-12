/**
 * TEMPORARY diagnostic — safe to delete once the order-history issue is solved.
 *
 * Answers one question: why does a known order not appear in the customer's
 * order history? It looks the order up, then replays the exact query the
 * history page runs, both with access control bypassed and as the customer,
 * so we can tell these apart:
 *
 *   - the order is not linked to the customer we think it is
 *   - access control is filtering it out
 *   - it is being pushed off the end of the 50-row page
 *   - it simply is not in the database
 *
 * Read-only: performs no writes.
 *
 *   npm run diagnose:orders -- --order=TH-MSPIX48U-CJ1D
 */
import config from "@payload-config";
import { getPayload, type Payload } from "payload";

const orderArg = process.argv.find((arg) => arg.startsWith("--order="));
const ORDER_NUMBER = orderArg?.split("=")[1]?.trim();

/** Mirrors the query in src/components/account/OrderHistory.tsx exactly. */
const HISTORY_SORT = "-originalCreatedAt";
const HISTORY_LIMIT = 50;

async function run() {
  if (!ORDER_NUMBER) {
    console.error("Pass an order number: -- --order=TH-XXXXXX-XXXX");
    process.exitCode = 1;
    return;
  }

  const payload = await getPayload({ config });
  activePayload = payload;

  const found = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: ORDER_NUMBER } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const order = found.docs[0];

  if (!order) {
    console.log(`[diag] No order "${ORDER_NUMBER}" exists in this database.`);
    console.log("[diag] => The site that took the payment writes to a DIFFERENT database than this .env points at.");
    return;
  }

  const customerId =
    typeof order.customer === "object" && order.customer
      ? order.customer.id
      : order.customer;

  console.log("[diag] Order found:");
  console.log(`  id                : ${order.id}`);
  console.log(`  orderNumber       : ${order.orderNumber}`);
  console.log(`  status            : ${order.status}`);
  console.log(`  payment.status    : ${order.payment?.status}`);
  console.log(`  payment.method    : ${order.payment?.method}`);
  console.log(`  customer (raw)    : ${JSON.stringify(order.customer)}`);
  console.log(`  email on order    : ${order.email}`);
  console.log(`  originalCreatedAt : ${order.originalCreatedAt}`);
  console.log(`  createdAt         : ${order.createdAt}`);

  if (!customerId) {
    console.log("[diag] => The order has NO customer linked. History filters by customer, so it can never appear.");
    return;
  }

  const customer = await payload.findByID({
    collection: "customers",
    id: customerId,
    depth: 0,
    overrideAccess: true,
  });
  console.log(`[diag] Linked customer: id=${customer.id} email=${customer.email}`);

  // 1. Everything this customer owns, newest first — no access control.
  const all = await payload.find({
    collection: "orders",
    where: { customer: { equals: customerId } },
    sort: HISTORY_SORT,
    limit: HISTORY_LIMIT,
    depth: 0,
    overrideAccess: true,
  });
  const position = all.docs.findIndex((doc) => doc.id === order.id);
  console.log(
    `[diag] Customer owns ${all.totalDocs} order(s) total; page 1 holds ${all.docs.length}.`,
  );
  console.log(
    position === -1
      ? `[diag] => NOT on page 1 of ${HISTORY_LIMIT}. It is being pushed off by older orders — a sorting/pagination problem.`
      : `[diag] Appears at position ${position + 1} of page 1 (unfiltered).`,
  );

  // 2. The same query as the signed-in customer, so access control applies.
  const asCustomer = await payload.find({
    collection: "orders",
    where: { customer: { equals: customerId } },
    sort: HISTORY_SORT,
    limit: HISTORY_LIMIT,
    depth: 0,
    overrideAccess: false,
    user: { ...customer, collection: "customers" } as Parameters<
      typeof payload.find
    >[0]["user"],
  });
  const visible = asCustomer.docs.some((doc) => doc.id === order.id);
  console.log(
    `[diag] With access control as this customer: ${asCustomer.docs.length} row(s) returned.`,
  );
  console.log(
    visible
      ? "[diag] => Visible to the customer. The data is fine; the problem is in the browser (wrong domain, stale session, or a cached response)."
      : "[diag] => BLOCKED by access control. The API returns it for admins but not for the customer.",
  );

  // 3. Newest few, to see what the history page would actually list first.
  console.log("[diag] Newest 5 for this customer:");
  for (const doc of all.docs.slice(0, 5)) {
    console.log(
      `  ${doc.orderNumber} | ${doc.status} | ${doc.originalCreatedAt}`,
    );
  }
}

let activePayload: Payload | undefined;
const keepAlive = setInterval(() => undefined, 1000);

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await activePayload?.destroy().catch(() => undefined);
    clearInterval(keepAlive);
    process.exit(process.exitCode ?? 0);
  });
