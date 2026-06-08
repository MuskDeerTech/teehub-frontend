import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/ui/ProductDetails";
import { allProducts, getProductBySlug } from "@/lib/products";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return allProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

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
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetails product={product} />;
}
