 "use client";

import { useState } from "react";
import FilterPanel from "./FilterPanel";

/**
 * The FILTERS pill plus the slide-in panel it controls. Lives in its own
 * client component so the surrounding `CategoryFilter` can stay a server
 * component (the pill links don't need JS).
 */
export default function FilterButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#d9d9d9] bg-white px-5 py-2.5 text-[12px] font-bold tracking-[1px] text-black transition-colors duration-200 hover:border-black max-[768px]:hidden"
      >
        <FilterIcon /> FILTERS
      </button>

      <FilterPanel slug={slug} open={open} onClose={() => setOpen(false)} />
    </>
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
