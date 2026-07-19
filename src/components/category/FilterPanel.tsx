"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FACET_PARAM,
  getFacetCounts,
  paramsToSelections,
  type FacetKey,
  type FacetSelections,
  type Product,
} from "@/lib/products";

/**
 * One pill in a facet section. `value` is what's stored on the product (and in
 * the URL); `label` is what the pill shows (defaults to `value`). `icon` is a
 * multi-colour SVG exported from Figma (public/svg/filters); `color` draws the
 * selected border; `bg` is the pill's pastel fill.
 */
type PillOption = {
  value: string;
  label?: string;
  icon: string;
  color: string;
  bg: string;
};

/**
 * The full, fixed option list per facet — every option always renders, with a
 * live count next to it, regardless of what the current page's products have.
 * `value`s must stay in sync with the facet select options in payload.config.ts.
 */
const pillSections: { title: string; facet: FacetKey; options: PillOption[] }[] = [
  {
    title: "Theme",
    facet: "themes",
    options: [
      { value: "Cricket", icon: "/svg/filters/cricket.svg", color: "#5B4FC7", bg: "#E7E3FA" },
      { value: "IPL", icon: "/svg/filters/ipl.svg", color: "#2E9E4F", bg: "#DFF3E1" },
      { value: "Football", icon: "/svg/filters/football.svg", color: "#E2492F", bg: "#FBE3D8" },
    ],
  },
  {
    title: "Category",
    facet: "type",
    options: [
      { value: "T-Shirts", icon: "/svg/filters/tshirt.svg", color: "#C426A9", bg: "#FBDFF0" },
      { value: "Polos", icon: "/svg/filters/polo.svg", color: "#E8930C", bg: "#FCEED3" },
      { value: "Jerseys", icon: "/svg/filters/jersey.svg", color: "#2F6FD0", bg: "#DCEAFB" },
    ],
  },
  {
    title: "Sleeves",
    facet: "sleeve",
    options: [
      { value: "Long", icon: "/svg/filters/long.svg", color: "#8B4A2F", bg: "#F6E3DA" },
      { value: "Short", icon: "/svg/filters/short.svg", color: "#7A9B1E", bg: "#F1F6D8" },
    ],
  },
];

/** Colour swatch circles; `hex` is the swatch fill, not a UI accent. */
const colorOptions: { value: string; hex: string }[] = [
  { value: "Black", hex: "#222222" },
  { value: "Red", hex: "#C0392B" },
  { value: "Orange", hex: "#F28C28" },
  { value: "Blue", hex: "#5B9BD5" },
  { value: "White", hex: "#FFFFFF" },
  { value: "Yellow", hex: "#E6B422" },
];

/** Fit pills show abbreviations; `value` stays the stored long form. */
const fitOptions: { value: string; label: string }[] = [
  { value: "Extra Small", label: "XS" },
  { value: "Small", label: "S" },
  { value: "Medium", label: "M" },
  { value: "Large", label: "L" },
  { value: "Extra Large", label: "XL" },
  { value: "Oversized", label: "O" },
];

// Pills are tracked as "facet::value" so one flat set spans every section.
const keyOf = (facet: FacetKey, value: string) => `${facet}::${value}`;

/** Group the flat pill set back into `{ facet: [values] }`. */
function selectionsOf(selected: Set<string>): FacetSelections {
  const sel: FacetSelections = {};
  for (const k of selected) {
    const [facet, value] = k.split("::") as [FacetKey, string];
    (sel[facet] ??= []).push(value);
  }
  return sel;
}

/** Counts render zero-padded to two digits — "(05)", "(101)". */
const fmtCount = (n: number) => String(n).padStart(2, "0");

const sortOptions = [
  "Featured",
  "New Arrivals",
  "Price Low to High",
  "Best Selling",
];

const PRICE_STEP = 100;
/** Slider bounds when the catalog is empty (nothing real to derive them from). */
const FALLBACK_PRICE_MAX = 5000;

export default function FilterPanel({
  products,
  open,
  onClose,
}: {
  /** The full published catalog (fetched by the page) — facet counts and the
   *  price bounds are catalog-wide no matter which page opened the panel. */
  products: Product[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Slider bounds from the real catalog: cheapest priceMin to dearest priceMax,
  // rounded outward to the step so every product stays inside the range.
  const bounds = useMemo(() => {
    if (!products.length) return { min: 0, max: FALLBACK_PRICE_MAX };
    let lo = Infinity;
    let hi = 0;
    for (const p of products) {
      lo = Math.min(lo, p.priceMin);
      hi = Math.max(hi, p.priceMax ?? p.priceMin);
    }
    const min = Math.floor(lo / PRICE_STEP) * PRICE_STEP;
    const max = Math.max(Math.ceil(hi / PRICE_STEP) * PRICE_STEP, min + PRICE_STEP);
    return { min, max };
  }, [products]);

  // A flat set of "facet::value" keys tracks every selected pill across groups.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState(bounds.min);
  const [priceMax, setPriceMax] = useState(bounds.max);
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
        for (const value of sel[facet] ?? []) next.add(keyOf(facet, value));
      }
      setSelected(next);
      const minP = searchParams.get("minPrice");
      setPriceMin(minP ? Number(minP) : bounds.min);
      const maxP = searchParams.get("maxPrice");
      setPriceMax(maxP ? Number(maxP) : bounds.max);
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

  // Recompute counts whenever a pill changes — this is what makes the numbers
  // reactive to other selections.
  const counts = useMemo(
    () => getFacetCounts(products, selectionsOf(selected)),
    [selected, products],
  );

  const removeAll = () => {
    setSelected(new Set());
    setPriceMin(bounds.min);
    setPriceMax(bounds.max);
    setSort(sortOptions[0]);
  };

  // Commit the current selections to the URL; the grid reads them and filters.
  // The panel is catalog-wide, but a /category/<slug> page only renders its own
  // products — so applying filters there lands on /category/all, where the grid
  // spans the whole catalog and can honour every count the panel promised.
  const apply = () => {
    const sel = selectionsOf(selected);
    const qs = new URLSearchParams();
    for (const facet of Object.keys(FACET_PARAM) as FacetKey[]) {
      const values = sel[facet];
      if (values?.length) qs.set(FACET_PARAM[facet], values.join(","));
    }
    if (priceMin > bounds.min) qs.set("minPrice", String(priceMin));
    if (priceMax < bounds.max) qs.set("maxPrice", String(priceMax));
    const query = qs.toString();
    const isScopedCategory =
      pathname.startsWith("/category/") && pathname !== "/category/all";
    const target = query && isScopedCategory ? "/category/all" : pathname;
    router.push(query ? `${target}?${query}` : pathname, { scroll: false });
    onClose();
  };

  return (
    <>
      {/* Dimmed backdrop — click to dismiss. */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[110] bg-black/35 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-0 z-[120] flex items-center justify-center p-4 ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`flex max-h-[92vh] w-full max-w-[620px] flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out ${
            open ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Header — divider is inset to match the section dividers below,
              just slightly thicker. */}
          <div className="px-7 pt-6">
            <h2 className="border-b-2 border-[#ececec] pb-4 text-[22px] font-semibold tracking-[-0.5px] text-black">
              Filters
            </h2>
          </div>

          {/* Scrollable body */}
          <div className="scrollbar-hide flex-1 divide-y divide-[#ececec] overflow-y-auto px-7">
            {/* Price Range + Sort By */}
            <div className="grid grid-cols-2 gap-8 py-5 max-[520px]:grid-cols-1">
              <div>
                <h3 className="text-[15px] font-bold text-black">Price Range</h3>
                <p className="mt-1.5 text-[14px] font-medium text-black">
                  {priceMin} - {priceMax} INR
                </p>
                <div className="relative mt-3 h-4">
                  <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#e5e5e5]" />
                  <div
                    className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#f1571f]"
                    style={{
                      left: `${((priceMin - bounds.min) / (bounds.max - bounds.min)) * 100}%`,
                      right: `${100 - ((priceMax - bounds.min) / (bounds.max - bounds.min)) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={bounds.min}
                    max={bounds.max}
                    step={PRICE_STEP}
                    value={priceMin}
                    onChange={(e) =>
                      setPriceMin(
                        Math.min(Number(e.target.value), priceMax - PRICE_STEP),
                      )
                    }
                    aria-label="Minimum price"
                    className="range-dual z-10"
                  />
                  <input
                    type="range"
                    min={bounds.min}
                    max={bounds.max}
                    step={PRICE_STEP}
                    value={priceMax}
                    onChange={(e) =>
                      setPriceMax(
                        Math.max(Number(e.target.value), priceMin + PRICE_STEP),
                      )
                    }
                    aria-label="Maximum price"
                    className="range-dual z-20"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-black">Sort By</h3>
                <div className="relative mt-2.5">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="Sort by"
                    className="w-full appearance-none rounded-2xl bg-[#f1f1f1] px-4 py-3 text-[14px] font-medium text-black outline-none"
                  >
                    {sortOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black" />
                </div>
              </div>
            </div>

            {/* Theme + Category */}
            {pillSections.slice(0, 2).map((section) => (
              <PillSectionBlock
                key={section.title}
                section={section}
                counts={counts[section.facet].counts}
                selected={selected}
                toggle={toggle}
              />
            ))}

            {/* Colors — swatch circles with a count badge. */}
            <div className="py-5">
              <h3 className="mb-4 text-[15px] font-bold text-black">Colors</h3>
              <div className="flex flex-wrap gap-4">
                {colorOptions.map((c) => {
                  const key = keyOf("colors", c.value);
                  const isOn = selected.has(key);
                  const count = counts.colors.counts[c.value] ?? 0;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggle(key)}
                      aria-label={`${c.value} (${count})`}
                      aria-pressed={isOn}
                      className={`relative h-11 w-11 rounded-full transition-shadow ${
                        isOn ? "ring-2 ring-black ring-offset-2" : ""
                      }`}
                      style={{
                        backgroundColor: c.hex,
                        border: c.value === "White" ? "1px solid #ddd" : undefined,
                      }}
                    >
                      <span className="absolute -bottom-1 -right-1 rounded-full border border-[#eee] bg-white px-1 py-px text-[10px] font-semibold leading-none text-black">
                        {fmtCount(count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sleeves */}
            <PillSectionBlock
              section={pillSections[2]}
              counts={counts.sleeve.counts}
              selected={selected}
              toggle={toggle}
            />

            {/* Fit — plain outline pills with abbreviated labels. */}
            <div className="py-5">
              <h3 className="mb-3.5 text-[15px] font-bold text-black">Fit</h3>
              <div className="flex flex-wrap gap-2.5">
                {fitOptions.map((o) => {
                  const key = keyOf("sizes", o.value);
                  const isOn = selected.has(key);
                  const count = counts.sizes.counts[o.value] ?? 0;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggle(key)}
                      className={`flex items-center gap-1 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-200 ${
                        isOn
                          ? "border-black bg-black text-white"
                          : "border-[#d9d9d9] bg-white text-black hover:border-black"
                      }`}
                    >
                      {o.label}
                      <span
                        className={`text-[11px] ${isOn ? "text-white/70" : "text-[#9a9a9a]"}`}
                      >
                        ({fmtCount(count)})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer actions — top divider inset to match the section dividers. */}
          <div className="mx-7 flex items-center justify-between gap-4 border-t border-[#ececec] py-5">
            <button
              type="button"
              onClick={removeAll}
              className="rounded-full border border-[#d9d9d9] bg-white px-6 py-3 text-[13px] font-semibold tracking-[0.5px] text-black transition-colors hover:border-black"
            >
              REMOVE ALL
            </button>
            <button
              type="button"
              onClick={apply}
              className="rounded-full bg-[#f1571f] px-12 py-3 text-[13px] font-semibold tracking-[0.5px] text-white transition-opacity hover:opacity-90"
            >
              APPLY
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** One facet section of tinted icon pills (Theme / Category / Sleeves). */
function PillSectionBlock({
  section,
  counts,
  selected,
  toggle,
}: {
  section: { title: string; facet: FacetKey; options: PillOption[] };
  counts: Record<string, number>;
  selected: Set<string>;
  toggle: (key: string) => void;
}) {
  return (
    <div className="py-5">
      <h3 className="mb-3.5 text-[15px] font-bold text-black">{section.title}</h3>
      <div className="flex flex-wrap gap-2.5">
        {section.options.map((opt) => {
          const key = keyOf(section.facet, opt.value);
          const isOn = selected.has(key);
          const count = counts[opt.value] ?? 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={isOn}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] transition-colors duration-200"
              style={{
                backgroundColor: opt.bg,
                border: `1.5px solid ${isOn ? opt.color : "transparent"}`,
              }}
            >
              <img src={opt.icon} alt="" width={16} height={16} aria-hidden="true" />
              <span className="font-medium text-black">
                {opt.label ?? opt.value}
              </span>
              <span className="text-[11px] text-[#6b6b6b]">
                ({fmtCount(count)})
              </span>
            </button>
          );
        })}
      </div>
    </div>
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
