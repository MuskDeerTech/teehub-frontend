import { NextResponse } from "next/server";
import type { WooCommerceProduct, WooCommerceCategory, WooCommerceImage, WooCommerceAttribute } from "@/types/Product";

const WC_API = "https://teehubshop.com/wp-json/wc/v3/products";

const WC_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || "ck_d3c0b18ca7ac7fbf059265d229555187de554abf";
const WC_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "cs_f0353b549d425dce8fd3a7697fb2954e890b0e65";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    const params = new URLSearchParams({
      consumer_key: WC_KEY,
      consumer_secret: WC_SECRET,
      per_page: "100",
      status: "publish",
      ...(slug && { slug }),
    });

    const url = `${WC_API}?${params.toString()}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Next.js App",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("WooCommerce API Error:", res.status, res.statusText);
      return NextResponse.json([]);
    }

    const data: WooCommerceProduct[] = await res.json();
    console.log("✅ Fetched from WooCommerce:", data.length, "published products");

    const products = data.map((p: WooCommerceProduct) => {
      const categories = p.categories?.map((cat: WooCommerceCategory) => ({
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
      })) || [];

      const images = p.images?.map((img: WooCommerceImage) => ({
        image: {
          url: img.src,
          alt: img.alt || p.name || "Product image",
        },
      })) || [];

      const regularPrice = parseFloat(p.price || p.regular_price || "0");
      const salePrice = p.sale_price ? parseFloat(p.sale_price) : undefined;

      const attributes = p.attributes?.map((attr: WooCommerceAttribute) => ({
        attribute: {
          name: attr.name,
        },
        values: attr.options?.map((opt: string, idx: number) => ({
          id: `${attr.id}-${idx}`,
          value: opt,
        })) || [],
      })) || [];

      const product = {
        id: p.id.toString(),
        slug: p.slug,
        name: p.name,
        regularPrice,
        salePrice,
        description: p.description || p.short_description || "",
        images,
        categories,
        attributes,
      };

      console.log("📦", product.name, "- ₹", product.regularPrice);
      return product;
    });

    console.log("✅ Returning", products.length, "published products");
    return NextResponse.json(products);
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json([]);
  }
}