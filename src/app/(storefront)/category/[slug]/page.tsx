import type { Metadata } from "next";
import { Suspense } from "react";
import CategoryFilter from "@/components/category/CategoryFilter";
import FilterableGrid from "@/components/category/FilterableGrid";
import PlaceholderTile from "@/components/ui/PlaceholderTile";
import {
  categoryList,
  getCategory,
  getPlaceholderColors,
  getProductsByCategory,
} from "@/lib/products";

type Params = { slug: string };

// Static export has no server, so every category URL must be enumerated at
// build time: one page per category slug, plus the "all" (VIEW ALL) page.
export function generateStaticParams(): Params[] {
  return [{ slug: "all" }, ...categoryList.map((c) => ({ slug: c.slug }))];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = slug === "all" ? "Shop All" : getCategory(slug)?.label;
  return { title: label ? `${label} - TeeHub` : "Shop - TeeHub" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const products = getProductsByCategory(slug);

  // A known category with no products yet still renders a full grid, but of
  // blank placeholder cards rather than the "no products" message.
  const showPlaceholders =
    products.length === 0 && (slug === "all" || getCategory(slug) !== undefined);
  const placeholderColors = showPlaceholders ? getPlaceholderColors(slug) : [];

  const gridClass =
    "mt-9 grid grid-cols-3 gap-x-16 gap-y-12 max-[640px]:grid-cols-2 max-[420px]:grid-cols-1";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-[clamp(16px,4vw,80px)] py-10">
      {/* Suspense boundary: the filter panel and grid read the URL query string
          via useSearchParams, which Next requires to be wrapped for the static
          export not to de-opt to fully client-side rendering. */}
      <Suspense fallback={null}>
        <CategoryFilter active={slug} />
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
