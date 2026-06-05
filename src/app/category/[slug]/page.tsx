import type { Metadata } from "next";
import CategoryFilter from "@/components/category/CategoryFilter";
import ProductTile from "@/components/ui/ProductTile";
import PlaceholderTile from "@/components/ui/PlaceholderTile";
import Pagination from "@/components/ui/Pagination";
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
  return { title: label ? `${label} — TeeHub` : "Shop — TeeHub" };
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
    "mt-9 grid grid-cols-3 gap-x-5 gap-y-10 max-[640px]:grid-cols-2 max-[420px]:grid-cols-1";

  return (
    <main className="mx-auto w-full max-w-[1440px] px-[clamp(16px,4vw,80px)] py-10">
      <CategoryFilter active={slug} />

      {products.length > 0 ? (
        <div className={gridClass}>
          {products.map((product) => (
            <ProductTile key={product.slug} product={product} />
          ))}
        </div>
      ) : showPlaceholders ? (
        <div className={gridClass}>
          {placeholderColors.map((bg, i) => (
            <PlaceholderTile key={i} bg={bg} />
          ))}
        </div>
      ) : (
        <p className="mt-20 text-center text-[15px] text-[#777]">
          No products here yet — check back soon.
        </p>
      )}

      {(products.length > 0 || showPlaceholders) && <Pagination />}
    </main>
  );
}
