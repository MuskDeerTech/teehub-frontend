// Central place for the homepage's content/data, separated from presentation.
// Swap these arrays for a CMS/API later without touching the components.

export const navLinks = ["NEW IN", "COLLECTIONS", "TRACK ORDER"];

/**
 * Single source of truth for the shop's categories. `slug` drives the URL
 * (`/category/<slug>`); `label` is what the UI shows. Add a CMS later and this
 * list becomes a fetch — the routing/components don't change.
 */
export type Category = { slug: string; label: string };

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

/** Right-hand category tiles (heading + finished tile image) in the mega-menu. */
export type MenuCategory = { title: string; image: string; slug: string };

export const menuCategories: MenuCategory[] = [
  { title: "IPL JERSEY 2026", image: "/images/hamburg/ipl-jersey.png", slug: "ipl-jersey" },
  { title: "POLO", image: "/images/hamburg/polo.png", slug: "polo" },
  { title: "FOOTBALL", image: "/images/hamburg/football.png", slug: "football" },
  { title: "HOODIES", image: "/images/hamburg/hoodies.png", slug: "hoodies" },
  { title: "CAPS", image: "/images/hamburg/cap.png", slug: "caps" },
  { title: "JACKETS", image: "/images/hamburg/jacket.png", slug: "jackets" },
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
  image?: string;
};

/** IPL jerseys — colours/titles only for now; images get dropped in later. */
export const iplJerseys: Product[] = [
  { slug: "rcb-jersey-2026", title: "RCB JERSEY 2026", bg: "#BF5550", priceMin: 899, priceMax: 1099 },
  { slug: "mi-jersey-2026", title: "MUMBAI INDIANS JERSEY 2026", bg: "#A8CCE9", priceMin: 899, priceMax: 1099 },
  { slug: "csk-jersey-2026", title: "CSK JERSEY 2026", bg: "#B29952", priceMin: 899, priceMax: 1099 },
  { slug: "mi-blue-jersey-2026", title: "MUMBAI INDIANS JERSEY 2026", bg: "#6188CF", priceMin: 899, priceMax: 1099 },
  { slug: "kkr-jersey-2026", title: "KKR JERSEY 2026", bg: "#9F6CC5", priceMin: 899, priceMax: 1099 },
  { slug: "gt-jersey-2026", title: "GUJARAT TITANS JERSEY 2026", bg: "#6480AC", priceMin: 899, priceMax: 1099 },
  { slug: "rr-jersey-2026", title: "RAJASTHAN ROYALS JERSEY 2026", bg: "#C661AF", priceMin: 899, priceMax: 1099 },
  { slug: "dc-jersey-2026", title: "DELHI CAPITALS JERSEY 2026", bg: "#DA6D9B", priceMin: 899, priceMax: 1099 },
  { slug: "lsg-jersey-2026", title: "LUCKNOW SUPER GIANTS JERSEY 2026", bg: "#6C89AD", priceMin: 899, priceMax: 1099 },
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

export function getCategory(slug: string): Category | undefined {
  return categoryList.find((c) => c.slug === slug);
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
