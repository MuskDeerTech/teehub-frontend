import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/ui/ProductDetails";
import { getProductBySlug } from "@/lib/catalog";

type Params = { slug: string };

// Product pages query Payload/Postgres. Render them at request time so deploys
// do not exhaust the database connection pool while collecting static params.
export const dynamic = "force-dynamic";

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

  return (
    <>
      <ProductDetails product={product} />
    
      {/*<LatestDrops />*/}
    </>
  );
}