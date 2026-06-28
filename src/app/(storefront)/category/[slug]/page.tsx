import type { Metadata } from "next";
import { Suspense } from "react";
import CategoryFilter from "@/components/category/CategoryFilter";
import FilterableGrid from "@/components/category/FilterableGrid";
import PlaceholderTile from "@/components/ui/PlaceholderTile";
import {
  getCategories,
  getCategory,
  getProductsByCategory,
} from "@/lib/catalog";
import { getPlaceholderColors } from "@/lib/products";

type Params = { slug: string };

// Category pages query Payload/Postgres. Render them at request time so deploys
// do not exhaust the database connection pool while collecting static params.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = slug === "all" ? "Shop All" : (await getCategory(slug))?.label;
  return { title: label ? `${label} - TeeHub` : "Shop - TeeHub" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProductsByCategory(slug),
  ]);

  // A known category with no products yet still renders a full grid, but of
  // blank placeholder cards rather than the "no products" message.
  const showPlaceholders =
    products.length === 0 &&
    (slug === "all" || categories.some((c) => c.slug === slug));
  const placeholderColors = showPlaceholders ? getPlaceholderColors(slug) : [];

  const gridClass =
    "mt-9 grid grid-cols-3 gap-x-16 gap-y-12 max-[640px]:grid-cols-2 max-[420px]:grid-cols-1";

  return (
    <main className="mx-auto w-full px-[clamp(16px,4vw,80px)] py-10">
      {/* Suspense boundary: the filter panel and grid read the URL query string
          via useSearchParams, which Next requires to be wrapped to keep the
          rest of the page statically renderable. */}
      <Suspense fallback={null}>
        <CategoryFilter active={slug} categories={categories} products={products} />
      </Suspense>

      {products.length > 0 ? (
        <Suspense fallback={null}>
          <FilterableGrid products={products} />
        </Suspense>
      ) : showPlaceholders ? (
        <div className={gridClass}>
          {placeholderColors.map((bg, i) => (
            <PlaceholderTile key={i} bg={bg} />
          ))}
        </div>
      ) : (
        <p className="mt-20 text-center text-[15px] text-[#777]">
          No products here yet - check back soon.
        </p>
      )}
    </main>
  );
}
