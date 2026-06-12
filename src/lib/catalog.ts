/**
 * Server-side catalog data layer: the storefront's bridge to Payload.
 *
 * These functions mirror the old static helpers in products.ts
 * (getProductsByCategory / getProductBySlug / getCategory) but read from the
 * database via Payload's Local API, mapping each doc into the existing
 * `Product`/`Category` types so no component changes shape. Server components
 * only — the client-side filter logic in products.ts stays as-is and operates
 * on the mapped objects it receives as props.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type {
  Media,
  Product as ProductDoc,
  Category as CategoryDoc,
} from "../../payload-types";
import type { Category, Product } from "@/lib/products";

const PAGE_LIMIT = 200;

function toCategory(doc: CategoryDoc): Category {
  const thumbnail =
    typeof doc.thumbnailImage === "object" && doc.thumbnailImage !== null
      ? doc.thumbnailImage
      : undefined;

  return {
    slug: doc.slug,
    label: doc.name,
    bg: doc.bg ?? undefined,
    thumbnailImage: thumbnail?.url
      ? { src: thumbnail.url, alt: thumbnail.alt || doc.name }
      : undefined,
  };
}

/** Resolved upload docs only — entries left as bare ids (depth 0) are skipped. */
function mediaDocs(images: ProductDoc["images"]): Media[] {
  return (images ?? []).filter(
    (img): img is Media => typeof img === "object" && img !== null,
  );
}

function toProduct(doc: ProductDoc): Product {
  const gallery = mediaDocs(doc.images)
    .filter((m) => m.url)
    .map((m) => ({ src: m.url as string, alt: m.alt }));

  return {
    slug: doc.slug,
    title: doc.title,
    bg: doc.bg,
    priceMin: doc.priceMin,
    priceMax: doc.priceMax ?? doc.priceMin,
    image: gallery[0]?.src,
    images: gallery.length ? gallery : undefined,
    themes: doc.themes ?? undefined,
    type: doc.type ?? undefined,
    colors: doc.colors ?? undefined,
    sleeve: doc.sleeve ?? undefined,
    sizes: doc.sizes ?? undefined,
    price: doc.price ?? undefined,
    originalPrice: doc.originalPrice ?? undefined,
    discountPercent: doc.discountPercent ?? undefined,
    rating: doc.rating ?? undefined,
    reviewCount: doc.reviewCount ?? undefined,
    fitPercent: doc.fitPercent ?? undefined,
    fitReviews: doc.fitReviews ?? undefined,
    freeShippingRemaining: doc.freeShippingRemaining ?? undefined,
    detailSizes: doc.detailSizes?.map((s) => s.label),
    details: doc.details?.map((d) => d.text),
    description: doc.description ?? undefined,
    prepaidPromo: doc.prepaidPromo ?? undefined,
  };
}

/** Active categories in display order — drives the pill row and static params. */
export async function getCategories(): Promise<Category[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "categories",
    where: { isActive: { equals: true } },
    sort: "sortOrder",
    depth: 1,
    limit: PAGE_LIMIT,
  });
  return res.docs.map(toCategory);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "categories",
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return res.docs[0] ? toCategory(res.docs[0]) : undefined;
}

/** Published products for a category; `"all"` returns the whole catalog. */
export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where:
      slug === "all"
        ? { isPublished: { equals: true } }
        : {
            and: [
              { isPublished: { equals: true } },
              { "category.slug": { equals: slug } },
            ],
          },
    sort: "sortOrder",
    depth: 1,
    limit: PAGE_LIMIT,
  });
  return res.docs.map(toProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where: {
      and: [{ isPublished: { equals: true } }, { slug: { equals: slug } }],
    },
    depth: 1,
    limit: 1,
  });
  return res.docs[0] ? toProduct(res.docs[0]) : undefined;
}

/** Every published product — used to enumerate product pages at build time. */
export async function getAllProducts(): Promise<Product[]> {
  return getProductsByCategory("all");
}
