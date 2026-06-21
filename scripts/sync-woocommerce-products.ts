import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { WooCommerceClient } from "../src/lib/woocommerce/client";
import {
  buildWooSyncCache,
  ensureFallbackCategory,
  getCategorySlugMap,
  syncProduct,
} from "../src/lib/woocommerce/sync";
import type {
  SyncReport,
  WooProduct,
  WooVariation,
} from "../src/lib/woocommerce/types";

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
let activePayload: Payload | undefined;

function destinationSlug(sourceSlug?: string) {
  const normalized = sourceSlug?.toLowerCase();
  return normalized ? (CATEGORY_ALIASES[normalized] ?? normalized) : undefined;
}

async function run() {
  const payload = await getPayload({ config });
  activePayload = payload;
  const woo = WooCommerceClient.fromEnv();
  const cache = await buildWooSyncCache(payload);
  const categoryMap = await getCategorySlugMap(payload);
  const fallbackCategory = await ensureFallbackCategory(payload);
  const products = await woo.getProducts();

  for (let index = 0; index < products.length; index += 1) {
    const product: WooProduct = products[index];
    try {
      const variations: WooVariation[] =
        product.type === "variable" ? await woo.getVariations(product.id) : [];
      const imageIds = [
        ...(product.images ?? []),
        ...variations.flatMap((variation) =>
          variation.image ? [variation.image] : [],
        ),
      ]
        .map((image) => cache.mediaByWooId.get(image.id)?.id)
        .filter((id): id is string | number => id !== undefined);
      const categorySlug =
        PRODUCT_CATEGORY_OVERRIDES[product.id] ??
        destinationSlug(product.categories?.[0]?.slug);
      const categoryId =
        (categorySlug ? categoryMap.get(categorySlug) : undefined) ??
        fallbackCategory.id;

      const result = await syncProduct(payload, product, {
        categoryId,
        imageIds: [...new Set(imageIds)],
        variations,
        cache,
      });
      report[result.action] += 1;
    } catch (error) {
      report.failed += 1;
      report.errors.push({
        type: "product",
        woocommerceId: product.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }

    if ((index + 1) % 20 === 0 || index + 1 === products.length) {
      console.log(`[products] ${index + 1}/${products.length}`);
    }
  }

  console.log(JSON.stringify(report, null, 2));
  if (report.failed > 0) process.exitCode = 1;
}

const keepAlive = setInterval(() => undefined, 1000);

console.log("Refreshing WooCommerce product dates...");
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await activePayload?.destroy();
    clearInterval(keepAlive);
  });
