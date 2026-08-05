import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryMarquee from "@/components/layout/CategoryMarquee";
import ProductDetails from "@/components/ui/ProductDetails";
import ReviewsSection from "@/components/product/ReviewsSection";
import LatestDrops from "@/components/sections/LatestDrops";
import { getProductBySlug } from "@/lib/catalog";
import { deliveryDateLabel, getProductPageSettings } from "@/lib/productPage";
import { getProductReviews } from "@/lib/reviews";
import { buildMetadata } from "@/lib/seo";

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

  if (!product) return { title: "Product - TeeHub" };

  return buildMetadata({
    title: `${product.title} - TeeHub`,
    description: product.description,
    path: `/product/${product.slug}`,
    seo: product.seo,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  // The product gates the page, but the settings and reviews don't depend on
  // it, so all three go out together rather than in series.
  const [product, settings, { reviews, summary }] = await Promise.all([
    getProductBySlug(slug),
    getProductPageSettings(),
    getProductReviews(slug),
  ]);

  if (!product) notFound();

  return (
    <>
      <CategoryMarquee />
      <ProductDetails
        product={product}
        settings={settings}
        // Resolved here so the estimate comes from the server clock, not the
        // visitor's — two people in different timezones see the same date.
        deliveryDate={deliveryDateLabel(settings.deliveryLeadDays)}
        reviews={<ReviewsSection reviews={reviews} summary={summary} />}
      />

      <LatestDrops
        productPage
        excludeSlug={product.slug}
        categorySlug={product.categorySlug}
      />
    </>
  );
}
