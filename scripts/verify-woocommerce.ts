import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { WooCommerceClient } from "../src/lib/woocommerce/client";

type Doc = Record<string, unknown> & { id: string | number };
type VerifyPayload = {
  find(args: Record<string, unknown>): Promise<{
    docs: Doc[];
    hasNextPage?: boolean;
    page?: number;
    totalDocs?: number;
    totalPages?: number;
  }>;
};

const db = (payload: Payload) => payload as unknown as VerifyPayload;
const LOCAL_PAGE_SIZE = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validEmail(value?: string) {
  return Boolean(value?.trim() && EMAIL_PATTERN.test(value.trim()));
}

async function importedIds(payload: Payload, collection: string) {
  const ids = new Set<number>();
  let page = 1;
  let totalDocs = 0;

  while (true) {
    const result = await db(payload).find({
      collection,
      where: { woocommerceId: { exists: true } },
      page,
      limit: LOCAL_PAGE_SIZE,
      depth: 0,
      select: { woocommerceId: true },
      overrideAccess: true,
    });
    totalDocs = result.totalDocs ?? totalDocs + result.docs.length;
    for (const doc of result.docs) {
      if (typeof doc.woocommerceId === "number") {
        ids.add(doc.woocommerceId);
      }
    }
    if (!result.hasNextPage && page >= (result.totalPages ?? page)) break;
    page += 1;
  }

  return { ids, totalDocs };
}

function missingIds(remote: Array<{ id: number }>, localIds: Set<number>) {
  return remote.map((doc) => doc.id).filter((id) => !localIds.has(id));
}

async function verifyOrders(payload: Payload, woo: WooCommerceClient) {
  const missing: number[] = [];
  const unimportable: Array<{ id: number; reason: string }> = [];
  const totalMismatches: number[] = [];
  let remote = 0;
  let page = 1;
  let totalPages = 1;

  do {
    const remotePage = await woo.orderPage(page);
    totalPages = remotePage.totalPages;
    remote += remotePage.data.length;

    const ids = remotePage.data.map((order) => order.id);
    const local = ids.length
      ? await db(payload).find({
          collection: "orders",
          where: { woocommerceId: { in: ids } },
          limit: ids.length,
          pagination: false,
          depth: 0,
          select: {
            woocommerceId: true,
            totalPrice: true,
          },
          overrideAccess: true,
        })
      : { docs: [] };
    const localByWooId = new Map(
      local.docs
        .filter((doc) => typeof doc.woocommerceId === "number")
        .map((doc) => [doc.woocommerceId as number, doc]),
    );

    for (const order of remotePage.data) {
      const imported = localByWooId.get(order.id);
      if (!imported) {
        if (!order.line_items?.length) {
          unimportable.push({
            id: order.id,
            reason: "WooCommerce order has no line items.",
          });
        } else if (
          order.billing?.email &&
          !validEmail(order.billing.email)
        ) {
          unimportable.push({
            id: order.id,
            reason: "WooCommerce order has an invalid billing email.",
          });
        } else {
          missing.push(order.id);
        }
      } else if (
        Number(imported.totalPrice ?? 0) !== Number(order.total ?? 0)
      ) {
        totalMismatches.push(order.id);
      }
    }

    if (page % 25 === 0 || page === totalPages) {
      console.log(
        `[orders] verified ${remote.toLocaleString()} records (${page}/${totalPages} pages)`,
      );
    }
    page += 1;
  } while (page <= totalPages);

  const imported = await db(payload).find({
    collection: "orders",
    where: { woocommerceId: { exists: true } },
    page: 1,
    limit: 1,
    depth: 0,
    select: { woocommerceId: true },
    overrideAccess: true,
  });

  return {
    remote,
    imported: imported.totalDocs ?? imported.docs.length,
    missing,
    unimportable,
    totalMismatches,
  };
}

async function run() {
  const payload = await getPayload({ config });
  const woo = WooCommerceClient.fromEnv();
  const [remoteProducts, remoteCustomers] = await Promise.all([
    woo.getProducts(),
    woo.getCustomers(),
  ]);
  const [products, customers] = await Promise.all([
    importedIds(payload, "products"),
    importedIds(payload, "customers"),
  ]);
  const orders = await verifyOrders(payload, woo);
  const missingCustomers = remoteCustomers.filter(
    (customer) => !customers.ids.has(customer.id),
  );
  const unimportableCustomers = missingCustomers
    .filter((customer) => !validEmail(customer.email))
    .map((customer) => ({
      id: customer.id,
      reason: customer.email?.trim()
        ? "WooCommerce customer has an invalid email."
        : "WooCommerce customer has no email.",
    }));
  const repairableMissingCustomers = missingCustomers
    .filter((customer) => validEmail(customer.email))
    .map((customer) => customer.id);

  const result = {
    products: {
      remote: remoteProducts.length,
      imported: products.totalDocs,
      missing: missingIds(remoteProducts, products.ids),
    },
    customers: {
      remote: remoteCustomers.length,
      imported: customers.totalDocs,
      missing: repairableMissingCustomers,
      unimportable: unimportableCustomers,
    },
    orders,
  };
  console.log(JSON.stringify(result, null, 2));

  const failed = Object.values(result).some(
    (section) =>
      section.missing.length > 0 ||
      ("totalMismatches" in section && section.totalMismatches.length > 0),
  );
  process.exit(failed ? 1 : 0);
}

const keepAlive = setInterval(() => undefined, 1000);

console.log("Starting WooCommerce verification...");
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    clearInterval(keepAlive);
  });
