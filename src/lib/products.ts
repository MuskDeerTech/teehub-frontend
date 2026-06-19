// Central place for the homepage's content/data, separated from presentation.
// Swap these arrays for a CMS/API later without touching the components.

import type { CSSProperties } from "react";

export const navLinks = ["NEW IN", "COLLECTIONS", "TRACK ORDER"];

/**
 * Manual position/zoom of an image inside its card, set with the drag/zoom
 * editors in the Payload admin: `scale` is a %, `x`/`y` are offsets as a % of
 * the card. Used by category menu tiles and product images alike.
 */
export type ImageFit = {
  scale?: number;
  x?: number;
  y?: number;
};

/** The CSS transform that replays an admin-set fit; undefined when no fit. */
export function fitTransform(fit?: ImageFit): CSSProperties | undefined {
  if (!fit) return undefined;
  return {
    transform: `translate(${fit.x ?? 0}%, ${fit.y ?? 0}%) scale(${(fit.scale ?? 100) / 100})`,
  };
}

/**
 * Single source of truth for the shop's categories. `slug` drives the URL
 * (`/category/<slug>`); `label` is what the UI shows. Add a CMS later and this
 * list becomes a fetch — the routing/components don't change.
 */
export type Category = {
  slug: string;
  label: string;
  // Solid colour behind the menu thumbnail tile (a transparent cutout PNG sits
  // on top). Mirrors the product `bg` pattern; CMS-controlled per category.
  bg?: string;
  thumbnailImage?: {
    src: string;
    alt: string;
  };
  // How the thumbnail sits inside the menu tile, set with the drag/zoom editor
  // in the Payload admin.
  thumbFit?: ImageFit;
};

export const categoryList: Category[] = [
  { slug: "ipl-jersey", label: "IPL JERSEY 2026" },
  { slug: "polo", label: "POLO" },
  { slug: "football", label: "FOOTBALL" },
  { slug: "hoodies", label: "HOODIES" },
  { slug: "caps", label: "CAPS" },
  { slug: "jackets", label: "JACKETS" },
];

/** Labels for the Hero pill row (derived so there's no second list to update). */
export const categories = categoryList.map((c) => c.label);

/** Left-hand collection links shown in the hamburger mega-menu. */
export const menuCollections = [
  "NEW ARRIVALS",
  "WINTER COLLECTION 2025",
  "BASICS",
  "TEEHUB CLUB",
  "ICONICS",
];

export type Team = { name: string; logo: string; logoWidth: number; logoHeight: number };

export const teams: Team[] = [
  { name: "MI", logo: "/svg/teams/mi.svg", logoWidth: 300, logoHeight: 189 },
  { name: "RCB", logo: "/svg/teams/rcb.svg", logoWidth: 265, logoHeight: 377 },
  { name: "CSK", logo: "/svg/teams/csk.svg", logoWidth: 298, logoHeight: 246 },
  { name: "DC", logo: "/svg/teams/dc.svg", logoWidth: 300, logoHeight: 300 },
  { name: "GT", logo: "/svg/teams/gt.svg", logoWidth: 190, logoHeight: 140 },
  { name: "KKR", logo: "/svg/teams/kkr.svg", logoWidth: 234, logoHeight: 361 },
  { name: "LSG", logo: "/svg/teams/lsg.svg", logoWidth: 568, logoHeight: 326 },
  { name: "PBKS", logo: "/svg/teams/pk.svg", logoWidth: 275, logoHeight: 352 },
  { name: "RR", logo: "/svg/teams/rr.svg", logoWidth: 152, logoHeight: 237 },
  { name: "SRH", logo: "/svg/teams/sh.svg", logoWidth: 401, logoHeight: 302 },
];

/** IPL jersey "drops" — shown in a colored card with a single price range. */
export type JerseyDrop = {
  title: string;
  image: string;
  alt: string;
  bg: string;
  price: string;
};

export const latestDrops: JerseyDrop[] = [
  {
    title: "BENGALURU PRACTICE JERSEY 2026",
    image: "/images/rcb-jersey.png",
    alt: "RCB",
    bg: "bg-[#c0352f]",
    price: "₹899.00 – ₹1,099.00",
  },
  {
    title: "MUMBAI INDIANS JERSEY 2026",
    image: "/images/mi-jersey.png",
    alt: "MI",
    bg: "bg-[#a8c5df]",
    price: "₹899.00 – ₹1,099.00",
  },
  {
    title: "CSK JERSEY 2026",
    image: "/images/csk-jersey.png",
    alt: "CSK",
    bg: "bg-[#bca256]",
    price: "₹899.00 – ₹1,099.00",
  },
  {
    title: "GT JERSEY 2026",
    image: "/images/gt-jersey.png",
    alt: "GT",
    bg: "bg-[#474747]",
    price: "₹899.00 – ₹1,099.00",
  },
];

/** Apparel products (hoodies / polos) — shown with an old + sale price. */
export type ApparelProduct = {
  title: string;
  image: string;
  alt: string;
  oldPrice: string;
  newPrice: string;
};

export const footballHoodies: ApparelProduct[] = [
  {
    title: "ARGENTINA WC 2026 HOODIE (SWEATSHIRT) — EMBROIDERY",
    image: "/images/agrentina-hoodie.png",
    alt: "Argentina Hoodie",
    oldPrice: "₹1,499.00",
    newPrice: "₹999.00",
  },
  {
    title: "BARCELONA RETRO SWEATSHIRT 1999 — OVERSIZED — DROP SHOULDER",
    image: "/images/barca-retro.png",
    alt: "Barcelona Hoodie",
    oldPrice: "₹1,199.00",
    newPrice: "₹999.00",
  },
  {
    title: "FC BARCELONA ED SHEERAN HOODIE EMBROIDERED CLIMA COOL PREMIUM",
    image: "/images/barca-ed.png",
    alt: "Barcelona Play Hoodie",
    oldPrice: "₹2,499.00",
    newPrice: "₹999.00",
  },
  {
    title:
      "BARCELONA TRAVIS SCOTT HOODIE — OVERSIZED — ACID WASH — PREMIUM — IN HOUSE MADE",
    image: "/images/barca-ts.png",
    alt: "Barcelona Travis Hoodie",
    oldPrice: "₹2,499.00",
    newPrice: "₹999.00",
  },
];

export const poloShirts: ApparelProduct[] = [
  {
    title: "RCB GREEN TRAVEL POLO 2025- SHINING LOGOS",
    image: "/images/rbc-green.png",
    alt: "rcb green tshirt",
    oldPrice: "₹1,499.00",
    newPrice: "₹999.00",
  },
  {
    title: "BENGALURU TRAVEL POLO 2025 - SHINING",
    image: "/images/bengaluru-travel-red.png",
    alt: "bengaluru travel red",
    oldPrice: "₹1,199.00",
    newPrice: "₹999.00",
  },
  {
    title: "BENGALURU TRAVEL POLO 2025 - SHINING",
    image: "/images/bengaluru-travel-orange.png",
    alt: "bengaluru travel orange",
    oldPrice: "₹1,199.00",
    newPrice: "₹999.00",
  },
  {
    title: "BENGALURU TRAVEL POLO 2025 - SHINING",
    image: "/images/bengaluru-travel-grey.png",
    alt: "bengaluru travel grey",
    oldPrice: "₹1,199.00",
    newPrice: "₹999.00",
  },
];

/**
 * Catalog product shown on a category listing page (the grid of cards).
 *
 * Design notes for the eventual CMS swap:
 *  - `image` is an optional string: a local `/images/...` path now, a CMS URL
 *    later. Both are just strings, so components never change. It's optional so
 *    we can build the cards as coloured boxes before the Figma exports land.
 *  - Prices are NUMBERS, not pre-formatted strings, so we can sort/filter later
 *    and format the ₹ once in `formatPriceRange`.
 *  - `bg` is the card's background colour; the jersey image sits on top of it
 *    (`object-contain`), which keeps every card uniform regardless of how
 *    differently sized the source images are.
 */
export type Product = {
  slug: string;
  title: string;
  bg: string;
  priceMin: number;
  priceMax: number;
  // Catalog card image (the `cardImage` upload) shown on the listing tiles.
  image?: string;
  // Admin-set drag/zoom of the card image inside its tile — independent of the
  // detail gallery fits below, so cropping the card never touches the gallery.
  cardFit?: ImageFit;
  // Full gallery for the detail page. Populated by the CMS mapping in
  // catalog.ts; static products may omit it. `fit` is the admin-set drag/zoom
  // of that image inside its card.
  images?: { src: string; alt: string; fit?: ImageFit }[];
  // Filterable facets used by the filter panel. Optional so products can be
  // added before they're fully tagged (an untagged product just never matches
  // those facets and contributes nothing to their counts).
  themes?: string[];
  type?: string;
  colors?: string[];
  sleeve?: string;
  sizes?: string[];
  // Product-detail page ("/product/[slug]") fields. The catalog grid uses the
  // priceMin/priceMax range; the detail page shows a single sale price with the
  // struck-through MRP + discount, so these live here separately. All optional
  // so a product can render the page before it's fully merchandised.
  price?: number; // current sale price, e.g. 1200
  originalPrice?: number; // struck-through MRP, e.g. 2500
  discountPercent?: number; // discount badge value, e.g. 45
  rating?: number; // average star rating, e.g. 4.7
  reviewCount?: number; // number of ratings, e.g. 102
  fitPercent?: number; // "All sizes 96% fit"
  fitReviews?: number; // "(50 reviews)"
  freeShippingRemaining?: number; // ₹ left to unlock free shipping, e.g. 330
  detailSizes?: string[]; // size pills on the detail page (defaults to XS–XXXL)
  details?: string[]; // bullet lines under the "Details" heading
  description?: string; // long marketing paragraph under "Description"
  prepaidPromo?: string; // green prepaid-incentive line under the fit copy
};

// Every jersey is a short-sleeve cricket/IPL "Jersey"; colours and available
// sizes vary per product. These facets drive the filter panel's live counts.
const JERSEY_FACETS: Pick<Product, "themes" | "type" | "sleeve"> = {
  themes: ["Cricket", "IPL"],
  type: "Jerseys",
  sleeve: "Short",
};

/** IPL jerseys — colours/titles only for now; images get dropped in later. */
export const iplJerseys: Product[] = [
  {
    slug: "rcb-jersey-2026",
    title: "BENGALURU PRACTICE JERSEY 2026",
    bg: "#BF5550",
    priceMin: 899,
    priceMax: 1099,
    image: "/images/ipl-jersey/rcb.png",
    ...JERSEY_FACETS,
    colors: ["Red", "Black"],
    sizes: ["Extra Large", "Large", "Medium", "Small"],
    price: 1200,
    originalPrice: 2500,
    discountPercent: 45,
    rating: 4.7,
    reviewCount: 102,
    fitPercent: 96,
    fitReviews: 50,
    freeShippingRemaining: 330,
    detailSizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    details: ["100% cotton pique", "weight - 330 gsm", "embroidery (front & back)"],
    description:
      "make a powerful style statement with the bottle green saddle league polo t-shirt, crafted for those who appreciate bold design and premium quality. made from 100% cotton with a solid 330 gsm weight, this green cotton polo t-shirt offers a structured feel with everyday comfort. the detailed saddle league embroidery adds depth and character, giving this red embroidered polo t-shirt a refined yet striking look. designed to elevate your streetwear rotation, this bottle green saddle league polo t-shirt pairs effortlessly with loose fit cargos for a relaxed vibe or with streetwear jeans for a sharper urban finish. easy to maintain with a machine reverse wash, it's a standout essential built for confident styling.",
    prepaidPromo:
      "Prepaid saves 70 shipping unlocks 3 free gifts + Scratch n' Spice card ships faster.",
  },
  { slug: "mi-jersey-2026", title: "MUMBAI INDIANS JERSEY 2026", bg: "#A8CCE9", priceMin: 899, priceMax: 1099, image: "/images/ipl-jersey/mi.png", ...JERSEY_FACETS, colors: ["Blue", "White"], sizes: ["Large", "Medium", "Small"] },
  { slug: "csk-jersey-2026", title: "CSK JERSEY 2026", bg: "#B29952", priceMin: 899, priceMax: 1099, image: "/images/ipl-jersey/csk.png", ...JERSEY_FACETS, colors: ["Yellow", "Blue"], sizes: ["Extra Large", "Large", "Medium"] },
  { slug: "mi-blue-jersey-2026", title: "MUMBAI INDIANS JERSEY 2026", bg: "#6188CF", priceMin: 899, priceMax: 1099, image: "/images/ipl-jersey/mi2.png", ...JERSEY_FACETS, colors: ["Blue"], sizes: ["Large", "Medium", "Small", "Extra Small"] },
  { slug: "kkr-jersey-2026", title: "KKR JERSEY 2026", bg: "#9F6CC5", priceMin: 899, priceMax: 1099, image: "/images/ipl-jersey/kkr.png", ...JERSEY_FACETS, colors: ["Black", "Yellow"], sizes: ["Large", "Medium"] },
  { slug: "gt-jersey-2026", title: "GUJARAT TITANS JERSEY 2026", bg: "#6480AC", priceMin: 899, priceMax: 1099, image: "/images/ipl-jersey/gt.png", ...JERSEY_FACETS, colors: ["Blue", "Black"], sizes: ["Oversized", "Large", "Medium"] },
  { slug: "rr-jersey-2026", title: "RAJASTHAN ROYALS JERSEY 2026", bg: "#C661AF", priceMin: 899, priceMax: 1099, image: "/images/ipl-jersey/rr.png", ...JERSEY_FACETS, colors: ["Red", "Blue"], sizes: ["Large", "Medium", "Small"] },
  { slug: "dc-jersey-2026", title: "DELHI CAPITALS JERSEY 2026", bg: "#DA6D9B", priceMin: 899, priceMax: 1099, image: "/images/ipl-jersey/blihi.png", ...JERSEY_FACETS, colors: ["Blue", "Red"], sizes: ["Extra Large", "Large", "Medium"] },
  { slug: "lsg-jersey-2026", title: "LUCKNOW SUPER GIANTS JERSEY 2026", bg: "#6C89AD", priceMin: 899, priceMax: 1099, image: "/images/ipl-jersey/gt2.png", ...JERSEY_FACETS, colors: ["Blue", "Orange"], sizes: ["Large", "Medium", "Small"] },
];

/** Products keyed by category slug. New categories slot in here (or via a CMS). */
const productsByCategory: Record<string, Product[]> = {
  "ipl-jersey": iplJerseys,
};

/** All products for a category. `"all"` returns every product (the VIEW ALL pill). */
export function getProductsByCategory(slug: string): Product[] {
  if (slug === "all") return Object.values(productsByCategory).flat();
  return productsByCategory[slug] ?? [];
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return categoryList.find((c) => c.slug === slug);
}

/** Every catalog product, flattened — the set the filter panel counts over. */
export const allProducts: Product[] = Object.values(productsByCategory).flat();

/**
 * The filterable facets, mapped to the `Product` field each one reads. Adding a
 * facet here is all it takes for the counting logic below to pick it up.
 */
export type FacetKey = "themes" | "type" | "colors" | "sleeve" | "sizes";

/** A product's values for one facet, normalised to an array (so single-value
 *  fields like `type`/`sleeve` count the same way as the list fields). */
function facetValues(p: Product, key: FacetKey): string[] {
  const v = p[key];
  return Array.isArray(v) ? v : v ? [v] : [];
}

/** The currently selected option labels per facet (empty/absent = no filter). */
export type FacetSelections = Partial<Record<FacetKey, string[]>>;

/** Does a product satisfy every selected facet *except* the one being counted?
 *  Across facets it's AND; within a facet, multiple selections are OR. We skip
 *  the facet being counted so its own options don't zero each other out — the
 *  standard reactive-facet behaviour. */
function matchesOtherFacets(
  p: Product,
  sel: FacetSelections,
  except: FacetKey,
): boolean {
  return (Object.keys(sel) as FacetKey[]).every((key) => {
    if (key === except) return true;
    const chosen = sel[key];
    if (!chosen?.length) return true;
    const vals = facetValues(p, key);
    return chosen.some((c) => vals.includes(c));
  });
}

/** URL query-param name for each facet, e.g. `?color=Blue,Red&size=Large`.
 *  Keeping the mapping here means the panel and the grid agree on the format. */
export const FACET_PARAM: Record<FacetKey, string> = {
  themes: "theme",
  type: "category",
  colors: "color",
  sleeve: "sleeve",
  sizes: "size",
};

/** Read a `{ facet: [labels] }` selection back out of URL search params. */
export function paramsToSelections(params: URLSearchParams): FacetSelections {
  const sel: FacetSelections = {};
  for (const key of Object.keys(FACET_PARAM) as FacetKey[]) {
    const raw = params.get(FACET_PARAM[key]);
    if (raw) sel[key] = raw.split(",").filter(Boolean);
  }
  return sel;
}

/**
 * Narrow products by the selected facets (AND across facets, OR within one) and
 * an optional price ceiling. This is the actual "apply" — `getFacetCounts` is
 * for the live numbers; this is what trims the grid.
 */
export function filterProducts(
  products: Product[],
  sel: FacetSelections,
  maxPrice?: number,
): Product[] {
  return products.filter((p) => {
    for (const key of Object.keys(sel) as FacetKey[]) {
      const chosen = sel[key];
      if (!chosen?.length) continue;
      const vals = facetValues(p, key);
      if (!chosen.some((c) => vals.includes(c))) return false;
    }
    if (maxPrice != null && p.priceMin > maxPrice) return false;
    return true;
  });
}

/** Per-facet result: how many products match each option, plus `total` — the
 *  size of the set those options are counted within (products matching the
 *  *other* selected facets). An option whose count equals `total` covers every
 *  product in scope, so picking it narrows nothing — the panel uses this to
 *  hide redundant facets (e.g. "Theme" on a page that's all one theme). */
export type FacetResult = { total: number; counts: Record<string, number> };

/**
 * Live facet counts: for each facet, how many products would remain for each of
 * its options given the *other* facets' current selections. Options with no
 * matches are simply absent from `counts`.
 *
 * This is the function to swap for a backend/CMS call later — same return shape,
 * the panel doesn't change.
 */
export function getFacetCounts(
  products: Product[],
  sel: FacetSelections,
): Record<FacetKey, FacetResult> {
  const keys: FacetKey[] = ["themes", "type", "colors", "sleeve", "sizes"];
  const result = {} as Record<FacetKey, FacetResult>;
  for (const key of keys) {
    const base = products.filter((p) => matchesOtherFacets(p, sel, key));
    const counts: Record<string, number> = {};
    for (const p of base) {
      for (const v of facetValues(p, key)) counts[v] = (counts[v] ?? 0) + 1;
    }
    result[key] = { total: base.length, counts };
  }
  return result;
}

/** Card background colours reused for the blank placeholder cards. */
export const placeholderPalette = [
  "#BF5550", "#A8CCE9", "#B29952", "#6188CF", "#9F6CC5",
  "#6480AC", "#C661AF", "#DA6D9B", "#6C89AD",
];

/**
 * The placeholder palette jumbled into a per-category order. Same colours on
 * every page, but a different arrangement per slug. Seeded by the slug so the
 * order is deterministic — stable across builds and identical on server/client
 * (no hydration mismatch).
 */
export function getPlaceholderColors(slug: string): string[] {
  const seed = [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const colors = [...placeholderPalette];
  // Seeded Fisher–Yates shuffle driven by a small LCG.
  let state = seed;
  for (let i = colors.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) >>> 0;
    const j = state % (i + 1);
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  return colors;
}

/** Formats a product's price as a single `₹min – ₹max` (or just `₹min`) string. */
export function formatPriceRange({ priceMin, priceMax }: Product): string {
  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  return priceMax > priceMin ? `${fmt(priceMin)} – ${fmt(priceMax)}` : fmt(priceMin);
}
