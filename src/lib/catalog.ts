
import { getPayload } from "payload";
import config from "@payload-config";
import type {
  Media,
  Product as ProductDoc,
  Category as CategoryDoc,
} from "../../payload-types";
import type { Category, ImageFit, Product } from "@/lib/products";

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
    thumbFit: doc.thumbFit
      ? {
          scale: doc.thumbFit.scale ?? undefined,
          x: doc.thumbFit.x ?? undefined,
          y: doc.thumbFit.y ?? undefined,
        }
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
  const category =
    typeof doc.category === "object" && doc.category !== null
      ? doc.category
      : undefined;

  // Admin-set per-image fits, keyed by media id; entries for images no longer
  // in the gallery are simply never looked up.
  const fits: Record<string, ImageFit> =
    doc.imageFits && typeof doc.imageFits === "object" && !Array.isArray(doc.imageFits)
      ? (doc.imageFits as Record<string, ImageFit>)
      : {};

  const gallery = mediaDocs(doc.images)
    .filter((m) => m.url)
    .map((m) => ({ src: m.url as string, alt: m.alt, fit: fits[String(m.id)] }));

  // Catalog card is its own upload now, separate from the detail gallery, so
  // its crop (cardFit) is independent of the gallery image fits above.
  const cardImage =
    typeof doc.cardImage === "object" && doc.cardImage !== null
      ? doc.cardImage
      : undefined;

  return {
    slug: doc.slug,
    title: doc.title,
    categorySlug: category?.slug ?? undefined,
    categoryLabel: category?.name ?? undefined,
    bg: doc.bg,
    priceMin: doc.priceMin,
    priceMax: doc.priceMax ?? doc.priceMin,
    image: cardImage?.url ?? undefined,
    cardFit: doc.cardFit
      ? {
          scale: doc.cardFit.scale ?? undefined,
          x: doc.cardFit.x ?? undefined,
          y: doc.cardFit.y ?? undefined,
        }
      : undefined,
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
    allowCustomName: doc.allowCustomName ?? undefined,
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

/** Newest published products for a category, used by homepage category rows. */
export async function getLatestProductsByCategory(
  slug: string,
  limit = PAGE_LIMIT,
): Promise<Product[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where: {
      and: [
        { isPublished: { equals: true } },
        { "category.slug": { equals: slug } },
      ],
    },
    sort: "-originalCreatedAt",
    depth: 1,
    limit,
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


export async function searchProducts(
  query: string,
  limit = PAGE_LIMIT,
): Promise<Product[]> {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where: {
      and: [
        { isPublished: { equals: true } },
        ...words.map((word) => ({ title: { like: word } })),
      ],
    },
    sort: "sortOrder",
    depth: 1,
    limit,
  });
  return res.docs.map(toProduct);
}

/** Newest published products across every category. */
export async function getLatestProducts(limit = PAGE_LIMIT): Promise<Product[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where: { isPublished: { equals: true } },
    sort: "-originalCreatedAt",
    depth: 1,
    limit,
  });
  return res.docs.map(toProduct);
}
