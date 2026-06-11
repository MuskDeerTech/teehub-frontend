/**
 * Seeds Payload with the storefront's current hardcoded data, copying the
 * 6 categories and 9 IPL jerseys out of src/lib/products.ts. Idempotent:
 * existing docs (matched by slug) are updated, not duplicated, so it's safe
 * to re-run after editing the data.
 *
 * Run with: npm run seed
 * (bundled with esbuild first because `payload run`/tsx can't resolve this
 * project's local TS imports — see the "seed" script in package.json)
 */
import { getPayload } from "payload";
import config from "@payload-config";
import { categoryList, iplJerseys, type Product } from "@/lib/products";

// Payload's generated select types for the facet fields.
type Theme = "Cricket" | "IPL" | "Football" | "Movie";
type GarmentType = "T-Shirts" | "Polos" | "Jerseys" | "Hoodies";
type Color = "Black" | "Red" | "Orange" | "Blue" | "White" | "Yellow";
type Sleeve = "Long" | "Short" | "Halter";
type Fit =
  | "Oversized"
  | "Extra Large"
  | "Large"
  | "Medium"
  | "Small"
  | "Extra Small";

function toProductData(product: Product, categoryId: number) {
  return {
    title: product.title,
    slug: product.slug,
    category: categoryId,
    bg: product.bg,
    priceMin: product.priceMin,
    priceMax: product.priceMax,
    price: product.price ?? null,
    originalPrice: product.originalPrice ?? null,
    discountPercent: product.discountPercent ?? null,
    themes: (product.themes ?? []) as Theme[],
    type: (product.type ?? null) as GarmentType | null,
    colors: (product.colors ?? []) as Color[],
    sleeve: (product.sleeve ?? null) as Sleeve | null,
    sizes: (product.sizes ?? []) as Fit[],
    detailSizes: (product.detailSizes ?? []).map((label) => ({
      label,
      stock: 0,
    })),
    description: product.description ?? null,
    details: (product.details ?? []).map((text) => ({ text })),
    rating: product.rating ?? null,
    reviewCount: product.reviewCount ?? null,
    fitPercent: product.fitPercent ?? null,
    fitReviews: product.fitReviews ?? null,
    freeShippingRemaining: product.freeShippingRemaining ?? null,
    prepaidPromo: product.prepaidPromo ?? null,
    isPublished: true,
    isFeatured: false,
    sortOrder: iplJerseys.indexOf(product),
  };
}

async function seed() {
  const payload = await getPayload({ config });

  // Categories first — products need their ids for the relationship.
  const categoryIds: Record<string, number> = {};
  for (const [index, category] of categoryList.entries()) {
    const data = {
      name: category.label,
      slug: category.slug,
      sortOrder: index,
      isActive: true,
    };
    const existing = await payload.find({
      collection: "categories",
      where: { slug: { equals: category.slug } },
      limit: 1,
    });
    const doc = existing.docs[0]
      ? await payload.update({
          collection: "categories",
          id: existing.docs[0].id,
          data,
        })
      : await payload.create({ collection: "categories", data });
    categoryIds[category.slug] = doc.id;
    payload.logger.info(
      `category ${category.slug} ${existing.docs[0] ? "updated" : "created"} (id ${doc.id})`,
    );
  }

  for (const product of iplJerseys) {
    const data = toProductData(product, categoryIds["ipl-jersey"]);
    const existing = await payload.find({
      collection: "products",
      where: { slug: { equals: product.slug } },
      limit: 1,
    });
    const doc = existing.docs[0]
      ? await payload.update({
          collection: "products",
          id: existing.docs[0].id,
          data,
        })
      : await payload.create({ collection: "products", data });
    payload.logger.info(
      `product ${product.slug} ${existing.docs[0] ? "updated" : "created"} (id ${doc.id})`,
    );
  }

  payload.logger.info(
    `Seed complete: ${categoryList.length} categories, ${iplJerseys.length} products.`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
