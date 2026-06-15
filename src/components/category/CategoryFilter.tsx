import Link from "next/link";
import type { Category, Product } from "@/lib/products";
import FilterButton from "./FilterButton";

/**
 * The pill row at the top of a category page. The active pill is filled black;
 * the rest link to their own `/category/<slug>` page. `VIEW ALL` (slug `all`)
 * is prepended. FILTERS opens a slide-in filter panel.
 *
 * Categories and products come from the page (which reads Payload) so this
 * stays a server component with no data-fetching of its own.
 */
export default function CategoryFilter({
  active,
  categories,
  products,
}: {
  active: string;
  categories: Category[];
  products: Product[];
}) {
  const pills = [{ slug: "all", label: "VIEW ALL" }, ...categories];

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto">
        {pills.map((c) => {
          const isActive = c.slug === active;
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[12px] font-bold tracking-[1px] transition-colors duration-200 ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-[#d9d9d9] bg-white text-black hover:border-black"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      <FilterButton products={products} />
    </div>
  );
}
