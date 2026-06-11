import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/ui/ProductDetails";
import { getAllProducts, getProductBySlug } from "@/lib/catalog";

type Params = { slug: string };

// Product data lives in Payload now: pages are prerendered at build time from
// the DB, then refreshed in the background so admin edits go live without a
// redeploy.
export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product ? `${product.title} - TeeHub` : "Product - TeeHub",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetails product={product} />;
}
