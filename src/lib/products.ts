// Central place for the homepage's content/data, separated from presentation.
// Swap these arrays for a CMS/API later without touching the components.

export const navLinks = ["NEW IN", "COLLECTIONS", "TRACK ORDER"];

export const categories = [
  "IPL JERSEY 2026",
  "POLO",
  "FOOTBALL",
  "HOODIES",
  "CAPS",
  "JACKETS",
];

/** Left-hand collection links shown in the hamburger mega-menu. */
export const menuCollections = [
  "NEW ARRIVALS",
  "WINTER COLLECTION 2025",
  "BASICS",
  "TEEHUB CLUB",
  "ICONICS",
];

/** Right-hand category tiles (heading + finished tile image) in the mega-menu. */
export type MenuCategory = { title: string; image: string };

export const menuCategories: MenuCategory[] = [
  { title: "IPL JERSEY 2026", image: "/images/hamburg/ipl-jersey.png" },
  { title: "POLO", image: "/images/hamburg/polo.png" },
  { title: "FOOTBALL", image: "/images/hamburg/football.png" },
  { title: "HOODIES", image: "/images/hamburg/hoodies.png" },
  { title: "CAPS", image: "/images/hamburg/cap.png" },
  { title: "JACKETS", image: "/images/hamburg/jacket.png" },
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
