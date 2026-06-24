import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { WooCommerceClient } from "../src/lib/woocommerce/client";
import {
  buildWooSyncCache,
  ensureFallbackCategory,
  getCategorySlugMap,
  syncCustomer,
  syncMedia,
  syncOrder,
  syncProduct,
} from "../src/lib/woocommerce/sync";
import type {
  SyncAction,
  SyncReport,
  WooImage,
  WooVariation,
} from "../src/lib/woocommerce/types";

const CONCURRENCY = {
  media: Number(process.env.WOOCOMMERCE_MEDIA_CONCURRENCY || 3),
  customers: Number(process.env.WOOCOMMERCE_CUSTOMER_CONCURRENCY || 6),
  orders: Number(process.env.WOOCOMMERCE_ORDER_CONCURRENCY || 6),
};

const CATEGORY_ALIASES: Record<string, string> = {
  cricket: "cricket",
  "f1-merch": "formula-1",
  "football-hoodies": "hoodies",
  "football-jerseys": "football",
  "football-tees": "football",
  "india-jerseys": "india-jersey",
  "ipl-jerseys": "ipl-jersey",
  polos: "polo",
  shorts: "shorts",
};

const PRODUCT_CATEGORY_OVERRIDES: Record<number, string> = {
  30880: "india-jersey",
};

const report: SyncReport = {
  created: 0,
  updated: 0,
  skipped: 0,
  failed: 0,
  errors: [],
};
const discovered = {
  products: 0,
  media: 0,
  customers: 0,
  orders: 0,
};
const unrepairableCustomers: Array<{
  woocommerceId: number;
  reason: string;
}> = [];
const unrepairableOrders: Array<{
  woocommerceId: number;
  reason: string;
}> = [];
let activePayload: Payload | undefined;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validEmail(value?: string) {
  return Boolean(value?.trim() && EMAIL_PATTERN.test(value.trim()));
}

function destinationSlug(sourceSlug?: string) {
  const normalized = sourceSlug?.toLowerCase();
  return normalized ? (CATEGORY_ALIASES[normalized] ?? normalized) : undefined;
}

function record(action: SyncAction) {
  report[action] += 1;
}

async function safely(
  type: string,
  woocommerceId: number | undefined,
  operation: () => Promise<{ action: SyncAction }>,
) {
  try {
    record((await operation()).action);
  } catch (error) {
    report.failed += 1;
    report.errors.push({
      type,
      woocommerceId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function concurrentForEach<T>(
  records: T[],
  concurrency: number,
  operation: (record: T) => Promise<void>,
) {
  let index = 0;
  const workers = Array.from(
    { length: Math.min(Math.max(1, concurrency), records.length) },
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

function uniqueImages(images: WooImage[]) {
  return [
    ...new Map(
      images
        .filter((image) => image.id && image.src)
        .map((image) => [image.id, image]),
    ).values(),
  ];
}

async function repairProducts(
  payload: Payload,
  woo: WooCommerceClient,
  cache: Awaited<ReturnType<typeof buildWooSyncCache>>,
) {
  const products = (await woo.getProducts()).filter(
    (product) => !cache.productByWooId.has(product.id),
  );
  discovered.products = products.length;
  if (!products.length) return;

  console.log(`[products] found ${products.length} missing record(s).`);
  const categoryMap = await getCategorySlugMap(payload);
  const fallbackCategory = await ensureFallbackCategory(payload);

  for (const product of products) {
    const variations: WooVariation[] =
      product.type === "variable" ? await woo.getVariations(product.id) : [];
    const images = uniqueImages([
      ...(product.images ?? []),
      ...variations.flatMap((variation) =>
        variation.image ? [variation.image] : [],
      ),
    ]);
    const missingImages = images.filter(
      (image) => !cache.mediaByWooId.has(image.id),
    );
    discovered.media += missingImages.length;
    await concurrentForEach(
      missingImages,
      CONCURRENCY.media,
      async (image) => {
        await safely("media", image.id, () => syncMedia(payload, image, cache));
      },
    );

    const categorySlug =
      PRODUCT_CATEGORY_OVERRIDES[product.id] ??
      destinationSlug(product.categories?.[0]?.slug);
    const categoryId =
      (categorySlug ? categoryMap.get(categorySlug) : undefined) ??
      fallbackCategory.id;
    const imageIds = images
      .map((image) => cache.mediaByWooId.get(image.id)?.id)
      .filter((id): id is string | number => id !== undefined);
    const sourceSlug =
      product.slug || `woocommerce-product-${product.id}`;
    const slugOverride = cache.productBySlug.has(sourceSlug.toLowerCase())
      ? `${sourceSlug}-wc-${product.id}`
      : sourceSlug;

    await safely("product", product.id, () =>
      syncProduct(payload, product, {
        categoryId,
        imageIds,
        cache,
        slugOverride,
        matchExistingBySkuOrSlug: false,
      }),
    );
  }
}

async function repairCustomers(
  payload: Payload,
  woo: WooCommerceClient,
  cache: Awaited<ReturnType<typeof buildWooSyncCache>>,
) {
  let page = 1;
  let totalPages = 1;
  do {
    const result = await woo.customerPage(page);
    totalPages = result.totalPages;
    const missing = result.data.filter(
      (customer) => !cache.customerByWooId.has(customer.id),
    );
    discovered.customers += missing.length;

    await concurrentForEach(
      missing,
      CONCURRENCY.customers,
      async (customer) => {
        if (!validEmail(customer.email)) {
          unrepairableCustomers.push({
            woocommerceId: customer.id,
            reason: customer.email?.trim()
              ? "WooCommerce customer has an invalid email address."
              : "WooCommerce customer has no email address.",
          });
          return;
        }
        await safely("customer", customer.id, () =>
          syncCustomer(payload, customer, cache),
        );
      },
    );

    if (page % 25 === 0 || page === totalPages) {
      console.log(`[customers] scanned page ${page}/${totalPages}`);
    }
    page += 1;
  } while (page <= totalPages);
}

async function repairOrders(
  payload: Payload,
  woo: WooCommerceClient,
  cache: Awaited<ReturnType<typeof buildWooSyncCache>>,
) {
  let page = 1;
  let totalPages = 1;
  do {
    const result = await woo.orderPage(page);
    totalPages = result.totalPages;
    const missing = result.data.filter(
      (order) => !cache.orderByWooId.has(order.id),
    );
    discovered.orders += missing.length;

    await concurrentForEach(missing, CONCURRENCY.orders, async (order) => {
      if (!order.line_items?.length) {
        unrepairableOrders.push({
          woocommerceId: order.id,
          reason: "WooCommerce order has no line items.",
        });
        return;
      }
      if (order.billing?.email && !validEmail(order.billing.email)) {
        unrepairableOrders.push({
          woocommerceId: order.id,
          reason: "WooCommerce order has an invalid billing email.",
        });
        return;
      }
      await safely("order", order.id, () => syncOrder(payload, order, cache));
    });

    if (missing.length || page % 25 === 0 || page === totalPages) {
      console.log(
        `[orders] scanned page ${page}/${totalPages}; repaired ${missing.length}`,
      );
    }
    page += 1;
  } while (page <= totalPages);
}

async function run() {
  const payload = await getPayload({ config });
  activePayload = payload;
  const woo = WooCommerceClient.fromEnv();
  const cache = await buildWooSyncCache(payload);

  console.log(
    `Loaded existing records: ${cache.productByWooId.size} products, ${cache.customerByWooId.size} customers, ${cache.orderByWooId.size} orders.`,
  );

  await repairProducts(payload, woo, cache);
  await repairCustomers(payload, woo, cache);
  await repairOrders(payload, woo, cache);

  console.log(
    JSON.stringify(
      {
        discoveredMissing: discovered,
        sync: report,
        unrepairableCustomers,
        unrepairableOrders,
      },
      null,
      2,
    ),
  );
  if (report.failed > 0) process.exitCode = 1;
}

const keepAlive = setInterval(() => undefined, 1000);

console.log("Starting targeted WooCommerce repair...");
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await activePayload?.destroy();
    clearInterval(keepAlive);
  });
