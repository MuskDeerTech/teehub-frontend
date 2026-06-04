import Link from "next/link";
import { categoryList } from "@/lib/products";

/**
 * The pill row at the top of a category page. The active pill is filled black;
 * the rest link to their own `/category/<slug>` page. `VIEW ALL` (slug `all`)
 * is prepended. FILTERS is a placeholder control for now.
 */
export default function CategoryFilter({ active }: { active: string }) {
  const pills = [{ slug: "all", label: "VIEW ALL" }, ...categoryList];

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

      <button
        type="button"
        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#d9d9d9] bg-white px-5 py-2.5 text-[12px] font-bold tracking-[1px] text-black transition-colors duration-200 hover:border-black max-[768px]:hidden"
      >
        <FilterIcon /> FILTERS
      </button>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M1 3h14M3.5 8h9M6 13h4" />
    </svg>
  );
}
