import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { WooCommerceClient } from "../src/lib/woocommerce/client";
import {
  syncCustomer,
  type WooSyncCache,
} from "../src/lib/woocommerce/sync";
import type { SyncReport } from "../src/lib/woocommerce/types";

type Doc = Record<string, unknown> & { id: string | number };
type CustomerPayload = {
  find(args: Record<string, unknown>): Promise<{ docs: Doc[] }>;
};

const db = (payload: Payload) => payload as unknown as CustomerPayload;
const CONCURRENCY = Number(
  process.env.WOOCOMMERCE_CUSTOMER_CONCURRENCY || 8,
);
const report: SyncReport = {
  created: 0,
  updated: 0,
  skipped: 0,
  failed: 0,
  errors: [],
};
let activePayload: Payload | undefined;

async function customerCache(payload: Payload): Promise<WooSyncCache> {
  const result = await db(payload).find({
    collection: "customers",
    limit: 100000,
    pagination: false,
    depth: 0,
    select: {
      woocommerceId: true,
      email: true,
    },
    overrideAccess: true,
  });
  const byWooId = new Map<number, Doc>();
  const byEmail = new Map<string, Doc>();
  for (const doc of result.docs) {
    if (typeof doc.woocommerceId === "number") {
      byWooId.set(doc.woocommerceId, doc);
    }
    if (typeof doc.email === "string" && doc.email) {
      byEmail.set(doc.email.toLowerCase(), doc);
    }
  }
  return {
    mediaByWooId: new Map(),
    productByWooId: new Map(),
    productBySku: new Map(),
    productBySlug: new Map(),
    customerByWooId: byWooId,
    customerByEmail: byEmail,
    orderByWooId: new Map(),
    orderByNumber: new Map(),
  };
}

async function concurrentForEach<T>(
  records: T[],
  operation: (record: T) => Promise<void>,
) {
  let index = 0;
  const workers = Array.from(
    { length: Math.min(CONCURRENCY, records.length) },
    async () => {
      while (index < records.length) {
        const record = records[index];
        index += 1;
        await operation(record);
      }
    },
  );
  await Promise.all(workers);
}

async function run() {
  const payload = await getPayload({ config });
  activePayload = payload;
  const woo = WooCommerceClient.fromEnv();
  const cache = await customerCache(payload);
  let page = 1;
  let totalPages = 1;
  let processed = 0;

  do {
    const result = await woo.customerPage(page);
    totalPages = result.totalPages;
    await concurrentForEach(result.data, async (customer) => {
      try {
        const synced = await syncCustomer(payload, customer, cache);
        report[synced.action] += 1;
      } catch (error) {
        report.failed += 1;
        report.errors.push({
          type: "customer",
          woocommerceId: customer.id,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });
    processed += result.data.length;
    console.log(
      `[customers] ${processed.toLocaleString()} records (${page}/${totalPages} pages)`,
    );
    page += 1;
  } while (page <= totalPages);

  console.log(JSON.stringify(report, null, 2));
  if (report.failed > 0) process.exitCode = 1;
}

const keepAlive = setInterval(() => undefined, 1000);

console.log("Refreshing WooCommerce customer metrics...");
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await activePayload?.destroy();
    clearInterval(keepAlive);
  });
