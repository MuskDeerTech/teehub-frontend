"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FACET_PARAM,
  getFacetCounts,
  getProductsByCategory,
  paramsToSelections,
  type FacetKey,
  type FacetSelections,
} from "@/lib/products";

/**
 * Each panel section maps to one product facet. `options` is the full ordered
 * label list for that facet; the live count decides which actually render (an
 * option with zero matches is hidden). Add real data in `products.ts` and the
 * counts here update automatically.
 */
const sections: { title: string; facet: FacetKey; options: string[] }[] = [
  {
    title: "Theme",
    facet: "themes",
    options: ["Cricket", "IPL", "Football", "Movie"],
  },
  {
    title: "Category",
    facet: "type",
    options: ["T-Shirts", "Polos", "Jerseys", "Hoodies"],
  },
  {
    title: "Colors",
    facet: "colors",
    options: ["Black", "Red", "Orange", "Blue", "White", "Yellow"],
  },
  {
    title: "Sleeves",
    facet: "sleeve",
    options: ["Long", "Short", "Halter"],
  },
  {
    title: "Fit",
    facet: "sizes",
    options: ["Oversized", "Extra Large", "Large", "Medium", "Small", "Extra Small"],
  },
];

// Pills are tracked as "facet::label" so one flat set spans every section.
const keyOf = (facet: FacetKey, label: string) => `${facet}::${label}`;

/** Group the flat pill set back into `{ facet: [labels] }`. */
function selectionsOf(selected: Set<string>): FacetSelections {
  const sel: FacetSelections = {};
  for (const k of selected) {
    const [facet, label] = k.split("::") as [FacetKey, string];
    (sel[facet] ??= []).push(label);
  }
  return sel;
}

const sortOptions = [
  "Featured",
  "New Arrivals",
  "Price Low to High",
  "Best Selling",
];

const PRICE_MAX = 5000;

export default function FilterPanel({
  slug,
  open,
  onClose,
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // A flat set of "facet::label" keys tracks every selected pill across groups.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [price, setPrice] = useState(PRICE_MAX);
  const [sort, setSort] = useState(sortOptions[0]);

  // When the panel opens, seed the controls from the URL so it reflects the
  // filters already applied (edits stay local until APPLY writes them back).
  // Done during render via a previous-value check — React's recommended pattern
  // for "reset state when a prop changes", rather than an effect.
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const sel = paramsToSelections(searchParams as unknown as URLSearchParams);
      const next = new Set<string>();
      for (const facet of Object.keys(sel) as FacetKey[]) {
        for (const label of sel[facet] ?? []) next.add(keyOf(facet, label));
      }
      setSelected(next);
      const mp = searchParams.get("maxPrice");
      setPrice(mp ? Number(mp) : PRICE_MAX);
    }
  }

  // Lock body scroll and allow Esc to close while the panel is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Counts are scoped to the current page's products: "all" sees the whole
  // catalog, a category page sees only its own products.
  const products = useMemo(() => getProductsByCategory(slug), [slug]);

  // Recompute counts whenever a pill changes — this is what makes the numbers
  // reactive to other selections.
  const counts = useMemo(
    () => getFacetCounts(products, selectionsOf(selected)),
    [selected, products],
  );

  const removeAll = () => {
    setSelected(new Set());
    setPrice(PRICE_MAX);
    setSort(sortOptions[0]);
  };

  // Commit the current selections to the URL; the grid reads them and filters.
  const apply = () => {
    const sel = selectionsOf(selected);
    const qs = new URLSearchParams();
    for (const facet of Object.keys(FACET_PARAM) as FacetKey[]) {
      const labels = sel[facet];
      if (labels?.length) qs.set(FACET_PARAM[facet], labels.join(","));
    }
    if (price < PRICE_MAX) qs.set("maxPrice", String(price));
    const query = qs.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    onClose();
  };

  return (
    <>
      {/* Dimmed backdrop — click to dismiss. */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4">
          <h2 className="text-[22px] font-semibold tracking-[-0.5px] text-black">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="text-black transition-opacity hover:opacity-60"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="scrollbar-hide flex-1 overflow-y-auto px-7">
          {sections.map((section) => {
            const { total, counts: facetCounts } = counts[section.facet];

            // Keep an option if it has matches now, or is already selected (so a
            // chosen pill never disappears out from under the user).
            const visible = section.options.filter((label) => {
              const key = keyOf(section.facet, label);
              return (facetCounts[label] ?? 0) > 0 || selected.has(key);
            });
            if (visible.length === 0) return null;

            // Hide a facet that can't narrow anything: every visible option
            // covers the whole scope (e.g. "Theme" on a page that's all IPL).
            const canNarrow = visible.some(
              (label) => (facetCounts[label] ?? 0) < total,
            );
            if (!canNarrow) return null;

            return (
              <div
                key={section.title}
                className="border-t border-[#ececec] py-5 first:border-t-0 first:pt-0"
              >
                <h3 className="mb-3.5 text-[15px] font-bold text-black">
                  {section.title}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {visible.map((label) => {
                    const key = keyOf(section.facet, label);
                    const isOn = selected.has(key);
                    const count = facetCounts[label] ?? 0;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggle(key)}
                        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-colors duration-200 ${
                          isOn
                            ? "border-black bg-black text-white"
                            : "border-transparent bg-[#f1f1f1] text-black hover:border-[#cfcfcf]"
                        }`}
                      >
                        <span className="font-medium">{label}</span>
                        <span
                          className={isOn ? "text-white/70" : "text-[#9a9a9a]"}
                        >
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Price Range */}
          <div className="border-t border-[#ececec] py-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-black">Price Range</h3>
              <span className="text-[14px] font-medium text-black">
                0 - {price} INR
              </span>
            </div>
            <p className="mb-3 text-[12px] text-[#9a9a9a]">Select Price Range</p>
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={100}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              aria-label="Maximum price"
              className="price-slider w-full"
              style={{ ["--pct" as string]: `${(price / PRICE_MAX) * 100}%` }}
            />
          </div>

          {/* Sort By */}
          <div className="border-t border-[#ececec] py-5">
            <h3 className="mb-1 text-[15px] font-bold text-black">Sort By</h3>
            <p className="mb-3 text-[12px] text-[#9a9a9a]">Select Sort Order</p>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort by"
                className="w-full appearance-none rounded-lg bg-[#f1f1f1] px-4 py-3 text-[14px] font-medium text-black outline-none"
              >
                {sortOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black" />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-4 px-7 py-5">
          <button
            type="button"
            onClick={removeAll}
            className="rounded-full border border-[#d9d9d9] px-6 py-3 text-[13px] font-semibold text-black transition-colors hover:border-black"
          >
            REMOVE ALL
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 rounded-full bg-[#f1571f] px-6 py-3 text-[13px] font-semibold tracking-[0.5px] text-white transition-opacity hover:opacity-90"
          >
            APPLY
          </button>
        </div>
      </aside>
    </>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
