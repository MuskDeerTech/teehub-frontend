import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
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
  WooProduct,
  WooVariation,
} from "../src/lib/woocommerce/types";

const CHECKPOINT_FILE = path.resolve(
  process.cwd(),
  "scripts/.woocommerce-migration-checkpoint.json",
);
const CONCURRENCY = {
  media: Number(process.env.WOOCOMMERCE_MEDIA_CONCURRENCY || 4),
  products: Number(process.env.WOOCOMMERCE_PRODUCT_CONCURRENCY || 6),
  customers: Number(process.env.WOOCOMMERCE_CUSTOMER_CONCURRENCY || 10),
  orders: Number(process.env.WOOCOMMERCE_ORDER_CONCURRENCY || 8),
};

type Checkpoint = {
  mediaDone?: boolean;
  productsDone?: boolean;
  customerPage?: number;
  orderPage?: number;
};

const report: SyncReport = {
  created: 0,
  updated: 0,
  skipped: 0,
  failed: 0,
  errors: [],
};
let activePayload: Payload | undefined;

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

const destinationSlug = (sourceSlug?: string) => {
  const normalized = sourceSlug?.toLowerCase();
  return normalized ? (CATEGORY_ALIASES[normalized] ?? normalized) : undefined;
};

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

async function loadCheckpoint(): Promise<Checkpoint> {
  if (process.argv.includes("--restart")) return {};
  try {
    return JSON.parse(await readFile(CHECKPOINT_FILE, "utf8")) as Checkpoint;
  } catch {
    return {};
  }
}

async function saveCheckpoint(checkpoint: Checkpoint) {
  await writeFile(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

async function clearCheckpoint() {
  await unlink(CHECKPOINT_FILE).catch(() => undefined);
}

function progress(stage: string, current: number, total: number) {
  const percent = total ? Math.round((current / total) * 100) : 100;
  console.log(
    `[${stage}] ${current.toLocaleString()}/${total.toLocaleString()} (${percent}%)`,
  );
}

async function productSetup(
  woo: WooCommerceClient,
  products: WooProduct[],
) {
  const variationsByProduct = new Map<number, WooVariation[]>();
  await concurrentForEach(products, 6, async (product) => {
    variationsByProduct.set(
      product.id,
      product.type === "variable" ? await woo.getVariations(product.id) : [],
    );
  });
  const images = uniqueImages([
    ...products.flatMap((product) => product.images ?? []),
    ...[...variationsByProduct.values()].flatMap((variations) =>
      variations.flatMap((variation) =>
        variation.image ? [variation.image] : [],
      ),
    ),
  ]);
  return { variationsByProduct, images };
}

async function run() {
  const ordersOnly = process.argv.includes("--orders-only");
  const dryRun = process.argv.includes("--dry-run");
  const payload = await getPayload({ config });
  activePayload = payload;
  const woo = WooCommerceClient.fromEnv();
  const products = ordersOnly ? [] : await woo.getProducts();

  if (dryRun) {
    const [{ images }, categoryMap, customerCount, orderCount] =
      await Promise.all([
        productSetup(woo, products),
        getCategorySlugMap(payload),
        woo.countCustomers(),
        woo.countOrders(process.env.WOOCOMMERCE_SYNC_AFTER),
      ]);
    const unmatchedCategorySlugs = [
      ...new Set(
        products
          .flatMap((product) => product.categories ?? [])
          .map((category) => destinationSlug(category.slug))
          .filter(
            (slug): slug is string =>
              typeof slug === "string" && !categoryMap.has(slug),
          ),
      ),
    ].sort();
    const unmatchedProductDetails = products
      .filter((product) => {
        const slug =
          PRODUCT_CATEGORY_OVERRIDES[product.id] ??
          destinationSlug(product.categories?.[0]?.slug);
        return !slug || !categoryMap.has(slug);
      })
      .map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        categories: product.categories ?? [],
      }));
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          media: images.length,
          products: products.length,
          customers: customerCount,
          orders: orderCount,
          unmatchedCategorySlugs,
          unmatchedProducts: unmatchedProductDetails.length,
          unmatchedProductDetails,
        },
        null,
        2,
      ),
    );
    return;
  }

  const checkpoint = await loadCheckpoint();
  const cache = await buildWooSyncCache(payload);
  console.log(
    `Loaded existing records: ${cache.productByWooId.size} products, ${cache.customerByWooId.size} customers, ${cache.orderByWooId.size} orders.`,
  );

  if (!ordersOnly) {
    const { variationsByProduct, images } = await productSetup(woo, products);
    if (!checkpoint.mediaDone) {
      let completed = 0;
      await concurrentForEach(images, CONCURRENCY.media, async (image) => {
        await safely("media", image.id, () => syncMedia(payload, image, cache));
        completed += 1;
        if (completed % 25 === 0 || completed === images.length) {
          progress("media", completed, images.length);
        }
      });
      checkpoint.mediaDone = true;
      await saveCheckpoint(checkpoint);
    }

    if (!checkpoint.productsDone) {
      const categoryMap = await getCategorySlugMap(payload);
      const fallbackCategory = await ensureFallbackCategory(payload);
      let completed = 0;
      await concurrentForEach(
        products,
        CONCURRENCY.products,
        async (product) => {
          const categorySlug =
            PRODUCT_CATEGORY_OVERRIDES[product.id] ??
            destinationSlug(product.categories?.[0]?.slug);
          const categoryId =
            (categorySlug ? categoryMap.get(categorySlug) : undefined) ??
            fallbackCategory.id;
          const productImages = product.images ?? [];
          const variationImages = (
            variationsByProduct.get(product.id) ?? []
          ).flatMap((variation) =>
            variation.image ? [variation.image] : [],
          );
          const imageIds = uniqueImages([
            ...productImages,
            ...variationImages,
          ])
            .map((image) => cache.mediaByWooId.get(image.id)?.id)
            .filter((id): id is string | number => id !== undefined);
          await safely("product", product.id, () =>
            syncProduct(payload, product, {
              categoryId,
              imageIds,
              cache,
            }),
          );
          completed += 1;
          if (completed % 20 === 0 || completed === products.length) {
            progress("products", completed, products.length);
          }
        },
      );
      checkpoint.productsDone = true;
      await saveCheckpoint(checkpoint);
    }

    let customerPage = (checkpoint.customerPage ?? 0) + 1;
    let customerProcessed = (customerPage - 1) * 100;
    while (true) {
      const page = await woo.customerPage(customerPage);
      await concurrentForEach(
        page.data,
        CONCURRENCY.customers,
        async (customer) => {
          await safely("customer", customer.id, () =>
            syncCustomer(payload, customer, cache),
          );
        },
      );
      customerProcessed += page.data.length;
      checkpoint.customerPage = customerPage;
      await saveCheckpoint(checkpoint);
      progress(
        "customers",
        customerProcessed,
        Math.max(customerProcessed, page.totalPages * 100),
      );
      if (customerPage >= page.totalPages) break;
      customerPage += 1;
    }
  }

  let orderPage = (checkpoint.orderPage ?? 0) + 1;
  let orderProcessed = (orderPage - 1) * 100;
  while (true) {
    const page = await woo.orderPage(
      orderPage,
      ordersOnly ? process.env.WOOCOMMERCE_SYNC_AFTER : undefined,
    );
    await concurrentForEach(page.data, CONCURRENCY.orders, async (order) => {
      await safely("order", order.id, () => syncOrder(payload, order, cache));
    });
    orderProcessed += page.data.length;
    checkpoint.orderPage = orderPage;
    await saveCheckpoint(checkpoint);
    progress(
      "orders",
      orderProcessed,
      Math.max(orderProcessed, page.totalPages * 100),
    );
    if (orderPage >= page.totalPages) break;
    orderPage += 1;
  }

  await clearCheckpoint();
  console.log(JSON.stringify(report, null, 2));
}

const keepAlive = setInterval(() => undefined, 1000);

console.log("Starting optimized WooCommerce migration...");
run()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await activePayload?.destroy();
    clearInterval(keepAlive);
    process.exit(process.exitCode ?? 0);
  });
  