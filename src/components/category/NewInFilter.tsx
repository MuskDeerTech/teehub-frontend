import Link from "next/link";
import type { Category, Product } from "@/lib/products";
import FilterButton from "./FilterButton";

/**
 * Pill row for `/new-in`. Same category shortcuts as shop pages, without a
 * redundant NEW IN pill — that lives in the navbar only.
 */
export default function NewInFilter({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const pills = [
    { href: "/category/all", label: "VIEW ALL" },
    ...categories.map((c) => ({
      href: `/category/${c.slug}`,
      label: c.label,
    })),
  ];

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="scrollbar-hide flex gap-3 overflow-x-auto">
        {pills.map((pill) => (
          <Link
            key={pill.href}
            href={pill.href}
            className="whitespace-nowrap rounded-full border border-[#d9d9d9] bg-white px-5 py-2.5 text-[12px] font-bold tracking-[1px] text-black transition-colors duration-200 hover:border-black"
          >
            {pill.label}
          </Link>
        ))}
      </div>

      <FilterButton products={products} />
    </div>
  );
}
