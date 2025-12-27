// WordPress Custom Post Type to App Data Transformer
import { Product } from "@/types/Product";

// WordPress Custom Post Type Product
interface WPCustomProduct {
  id: number;
  slug: string;
  status: string;
  type: string;
  title: {
    rendered: string;
  };
  meta?: {
    price?: string | number;
    sale_price?: string | number;
    regular_price?: string | number;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text?: string;
    }>;
    "wp:term"?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
  // Attributes might be stored in ACF or meta fields
  acf?: {
    attributes?: Array<{
      name: string;
      values: string[];
    }>;
  };
}

export function transformWordPressProduct(wpProduct: WPCustomProduct): Product {
  // Extract price from meta
  const regularPrice = parseFloat(
    String(wpProduct.meta?.regular_price || wpProduct.meta?.price || "0")
  );
  const salePrice = wpProduct.meta?.sale_price
    ? parseFloat(String(wpProduct.meta.sale_price))
    : undefined;

  // Extract categories from embedded terms
  const categories = wpProduct._embedded?.["wp:term"]?.[0]?.map((term) => ({
    id: term.id.toString(),
    name: term.name,
    slug: term.slug,
  })) || [];

  // Extract images
  const images = wpProduct._embedded?.["wp:featuredmedia"]
    ? wpProduct._embedded["wp:featuredmedia"].map((media) => ({
        image: {
          url: media.source_url,
          alt: media.alt_text || wpProduct.title.rendered,
        },
      }))
    : [];

  // Extract attributes (if stored in ACF)
  const attributes = wpProduct.acf?.attributes?.map((attr, index) => ({
    attribute: {
      name: attr.name,
    },
    values: attr.values.map((val, idx) => ({
      id: `${index}-${idx}`,
      value: val,
    })),
  })) || [];

  return {
    id: wpProduct.id.toString(),
    slug: wpProduct.slug,
    name: wpProduct.title.rendered,
    regularPrice,
    salePrice,
    description: "", // Add if you have description field
    images,
    categories,
    attributes,
  };
}

export function transformWordPressProducts(wpProducts: WPCustomProduct[]): Product[] {
  return wpProducts.map(transformWordPressProduct);
}