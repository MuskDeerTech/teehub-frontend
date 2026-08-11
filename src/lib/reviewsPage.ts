/**
 * Content for the standalone `/reviews` page.
 *
 * These are store-wide marketing figures, not per-product data: the `reviews`
 * collection holds product reviews only, has no per-aspect scores (Print,
 * Delivery, Customer Support) and is still admin-entered, so none of the
 * numbers below can be derived from it today. Keeping them here — typed, in one
 * place, shaped the way the page consumes them — means moving them to a Payload
 * global later is a swap of these consts for a `findGlobal` call, with the
 * components untouched. Same approach the homepage sections took before they
 * were wired to the CMS.
 */

export type ReviewsHeroContent = {
  /** Small orange eyebrow above the headline. */
  eyebrow: string;
  /** Rendered white; the emphasis line below it is orange. */
  headline: string;
  headlineAccent: string;
  background: string;
};

export type RatingBreakdownRow = {
  /** Whole-star bucket, 5 → 1. */
  star: 1 | 2 | 3 | 4 | 5;
  /** Share of all ratings, as a whole percent. */
  percent: number;
};

export type CategoryRating = {
  label: string;
  /** Out of 5, one decimal. */
  score: number;
};

export type ReviewsSummaryContent = {
  average: number;
  /** Pre-formatted because it's a rounded marketing figure ("12000+"), not a
   *  count we can compute. */
  totalLabel: string;
  breakdown: RatingBreakdownRow[];
  categories: CategoryRating[];
  verifiedTitle: string;
  verifiedBody: string;
};

export type FeaturedReview = {
  id: string;
  name: string;
  rating: number;
  body: string;
  /** Customer photo. Rendered at a fixed height, so `width`/`height` are the
   *  file's natural size and `cardWidth` is what the design lays out. */
  image: { src: string; alt: string; width: number; height: number };
  /** Rendered card width at full desktop scale, in px. */
  cardWidth: number;
  /** Circular avatar; falls back to the initial on a solid tile when absent. */
  avatar?: string;
};

export const reviewsHero: ReviewsHeroContent = {
  eyebrow: "GEAR UP",
  headline: "REPRESENT",
  headlineAccent: "WITH PRIDE.",
  background: "/images/review/review-background.png",
};

export const reviewsSummary: ReviewsSummaryContent = {
  average: 4.8,
  totalLabel: "12000+ Reviews",
  breakdown: [
    { star: 5, percent: 82 },
    { star: 4, percent: 13 },
    { star: 3, percent: 8 },
    { star: 2, percent: 2 },
    { star: 1, percent: 1 },
  ],
  categories: [
    { label: "Quality", score: 5.0 },
    { label: "Print", score: 4.7 },
    { label: "Comfort", score: 4.8 },
    { label: "Delivery", score: 4.9 },
    { label: "Customer Support", score: 4.2 },
  ],
  verifiedTitle: "VERIFIED REVIEWS",
  verifiedBody: "All reviews are from verified Tee Hub Customers",
};

/**
 * "Fan Gallery" — customer photos posted to Instagram, each paired with the
 * piece they bought.
 *
 * `product` is a flat snapshot rather than a `Product` lookup: these are
 * editorial picks, and the card only ever shows a name, a variant and a price.
 * Pointing `href` at the real slug means the link keeps working when these move
 * to the CMS and the snapshot becomes a relationship.
 */
export type FanGalleryPost = {
  id: string;
  authorName: string;
  isVerified: boolean;
  rating: number;
  ratingCount: number;
  body: string;
  photo: ReviewMedia;
  product: {
    name: string;
    variant: string;
    price: number;
    image: ReviewMedia;
    href: string;
  };
};

export const fanGallery: FanGalleryPost[] = [
  {
    id: "sreeju-sharma",
    authorName: "Sreeju Sharma",
    isVerified: true,
    rating: 4.9,
    ratingCount: 248,
    body:
      "The quality is insane! 🔥 Customized my own football jersey and it turned out even better than i imagined. Super comfy, great fit, and the print is solid. Thanks Teehub!",
    // MISSING ARTWORK — this file is not in /public/images/review/ yet, so the
    // card renders an empty tile until it is dropped in. Same for Ananya below.
    photo: {
      src: "/images/review/sreeju.png",
      alt: "Sreeju wearing a red and black custom football jersey on a rooftop",
    },
    product: {
      name: "Bengaluru Practice Jersey 2026",
      variant: "Black and Red",
      price: 1299,
      image: { src: "/images/ipl-jersey/rcb.png", alt: "" },
      href: "/product/rcb-jersey-2026",
    },
  },
  {
    id: "ananya-iyer",
    authorName: "Ananya Iyer",
    isVerified: true,
    rating: 5,
    ratingCount: 192,
    body:
      "Absolutely love my custom polo! The fabric is super soft and breathable, perfect fit and the print quality is top-notch. Got so many compliments already!",
    photo: {
      src: "/images/review/ananya.png",
      alt: "Ananya wearing a black and gold custom RCB polo",
    },
    product: {
      name: "RCB Striper Travel Polo",
      variant: "Black and Grey",
      price: 1199,
      image: { src: "/images/bengaluru-travel-grey.png", alt: "" },
      href: "/product/rcb-jersey-2026",
    },
  },
  {
    id: "rohit-sharma",
    authorName: "Rohit Sharma",
    isVerified: true,
    rating: 4.8,
    ratingCount: 176,
    body:
      "Finally got my custom IPL jersey! The quality is top-notch and the fit is perfect. Feels super comfy and looks even better in person. Proud to rep!",
    photo: {
      src: "/images/review/rohit.png",
      alt: "Rohit wearing the black Barcelona Travis Scott hoodie",
    },
    product: {
      name: "Barcelona Travis Scott Hoodie",
      variant: "Black and Purple",
      price: 1499,
      image: { src: "/images/barca-ts.png", alt: "" },
      href: "/product/rcb-jersey-2026",
    },
  },
  {
    id: "karthik-nair",
    authorName: "Karthik Nair",
    isVerified: true,
    rating: 4.9,
    ratingCount: 153,
    body:
      "Superb quality and perfect fit! The colors are vibrant and the material is premium. Wore it to the match and got so many compliments. Worth every penny!",
    photo: {
      src: "/images/review/karthik.png",
      alt: "Karthik wearing the cream Barcelona retro quarter-zip at sunset",
    },
    product: {
      // "Barcelone" is the design's spelling, kept so the card matches the mock.
      name: "Barcelone Retro Sweatshirt",
      variant: "Black and Red",
      price: 1299,
      image: { src: "/images/barca-retro.png", alt: "" },
      href: "/product/rcb-jersey-2026",
    },
  },
];

/** A card in the "Video Testimonials" row. No `src` yet — the films aren't
 *  cut, so the cards render their poster and play affordance and don't claim
 *  to be playable. Add the file and the tile becomes a real player. */
export type VideoTestimonial = {
  id: string;
  title: string;
  tagline: string;
  /** e.g. "2:45 MIN". */
  durationLabel: string;
  /** The small right-hand meta chip, e.g. "Team Insight". */
  audienceLabel: string;
  poster: ReviewMedia;
};

export const videoTestimonials: VideoTestimonial[] = [
  {
    id: "football-club",
    title: "Football Club Review",
    tagline: "Hear from athletes who wear our pride.",
    durationLabel: "2:45 MIN",
    audienceLabel: "Team Insight",
    poster: {
      src: "/images/review/football-review.png",
      alt: "A football club in matching black TeeHub jerseys",
    },
  },
  {
    id: "cricket-team",
    title: "Cricket Team Review",
    tagline: "Built for performance. Trusted by champions.",
    durationLabel: "3:12 MIN",
    audienceLabel: "Team Story",
    poster: {
      src: "/images/review/cricket-review.png",
      alt: "A cricket team in navy TeeHub kit",
    },
  },
  {
    id: "college-event",
    title: "College Event Jerseys",
    tagline: "See how we bring campus events to life.",
    durationLabel: "2:18 MIN",
    audienceLabel: "Student Voices",
    poster: {
      src: "/images/review/college-jersey.png",
      alt: "Students in matching TeeHub event shirts",
    },
  },
];

/** The dark figures strip under the video row. The icons carry their own
 *  orange, so they render as-is rather than being recoloured here. */
export type ReviewStat = {
  id: string;
  icon: string;
  value: string;
  label: string;
};

export const reviewStats: ReviewStat[] = [
  {
    id: "recommend",
    icon: "/svg/review/recommend.svg",
    value: "98%",
    label: "would recommend TeeHub",
  },
  {
    id: "sizing",
    icon: "/svg/review/accurate.svg",
    value: "96%",
    label: "said sizing was accurate",
  },
  {
    id: "reorder",
    icon: "/svg/review/bag.svg",
    value: "95%",
    label: "would order again",
  },
  {
    id: "customers",
    icon: "/svg/review/customer.svg",
    value: "12,500+",
    label: "happy customers",
  },
];

/** Design-scale height every card image is drawn at; widths follow from it. */
export const FEATURED_IMAGE_HEIGHT = 274;

/** One tab in "Reviews by Product". Icons are the same 32×32 artwork the
 *  category marquee uses, so the two strips can't drift apart. */
export type ReviewProductTab = {
  id: string;
  label: string;
  icon: string;
};

export const reviewProductTabs: ReviewProductTab[] = [
  {
    id: "football-jerseys",
    label: "Custom Football Jerseys",
    icon: "/svg/marquee/custom-football-jerseys.svg",
  },
  {
    id: "cricket-jerseys",
    label: "Custom Cricket Jerseys",
    icon: "/svg/marquee/custom-cricket-jerseys.svg",
  },
  { id: "polos", label: "Custom Polos", icon: "/svg/marquee/custom-polos.svg" },
  {
    id: "hoodies",
    label: "Premium Hoodies",
    icon: "/svg/marquee/premium-hoodies.svg",
  },
];

/** The chip row under the tabs. `all` is the reset; the others each narrow the
 *  list by a field on `ProductReview`, so none of them is a dead control. */
export type ReviewFilterId = "all" | "verified" | "photos" | "videos";

/** Rounded marketing figure shown on the "All Reviews" chip — the store-wide
 *  total, not the length of the sample below it. */
export const ALL_REVIEWS_LABEL = "11200";

/** Sort control. One option today, so it renders as a label rather than a
 *  menu — the reviews below are already authored in most-recent order. */
export const REVIEWS_SORT_LABEL = "Most Recent";

export type ReviewMedia = { src: string; alt: string };

export type ProductReview = {
  id: string;
  /** Which tab in `reviewProductTabs` this review sits under. */
  tabId: string;
  authorName: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  /** The large shot on the left of the row — the customer wearing the piece. */
  hero: ReviewMedia;
  /** Their remaining uploads, in the order the thumbnail strip shows them. */
  gallery: ReviewMedia[];
  hasVideo: boolean;
  helpfulYes: number;
  helpfulNo: number;
  sizeBought: string;
  /** Pre-formatted, like `totalLabel` above: these are authored design values,
   *  and formatting a fixed ISO date at render time would shift it by a day in
   *  negative-offset timezones for no gain. */
  purchasedOn: string;
  isVerifiedPurchase: boolean;
  productName: string;
  productCollection: string;
  /** Also pre-formatted — it's relative to the mock's authoring date, so
   *  computing it from `now` would drift away from the design immediately. */
  postedLabel: string;
};

/**
 * The reviews shown under the active tab.
 *
 * All three sit under Custom Football Jerseys because that is the tab the
 * design has selected, even though the products they name are cricket jerseys.
 * That inconsistency is the mock's; it disappears as soon as these rows come
 * from the `reviews` collection and carry a real product relationship.
 */
export const productReviews: ProductReview[] = [
  {
    id: "lalit-thakur",
    tabId: "football-jerseys",
    authorName: "Lalit Thakur",
    city: "Delhi",
    rating: 4.5,
    title: "Excellent Quality and Fit",
    body:
      "I'm really impressed with the Royal Strikers jersey. The black and gold design looks even better in person, and the fabric feels lightweight, soft, and breathable. The fit is true to size and comfortable enough to wear for an entire match or a casual day out.",
    hero: {
      src: "/images/review/lalit.png",
      alt: "Lalit wearing the Royal Strikers jersey under floodlights",
    },
    gallery: [
      { src: "/images/review/lalit1.png", alt: "Front of the Royal Strikers jersey" },
      { src: "/images/review/lalit2.png", alt: "Back of the jersey, printed LALIT 10" },
      { src: "/images/review/lalit3.png", alt: "Red and black sleeve detail" },
      { src: "/images/review/lalit4.png", alt: "Royal Strikers crest close-up" },
      { src: "/images/review/lalit5.png", alt: "Collar and neckline stitching" },
    ],
    hasVideo: false,
    helpfulYes: 24,
    helpfulNo: 1,
    sizeBought: "L",
    purchasedOn: "25 Apr 2026",
    isVerifiedPurchase: true,
    productName: "RCB Fan Jersey 2025",
    productCollection: "Official Fan Collection",
    postedLabel: "2 Weeks ago",
  },
  {
    id: "aman-verma",
    tabId: "football-jerseys",
    authorName: "Aman Verma",
    city: "Chennai",
    rating: 4.5,
    title: "Excellent Fit",
    body:
      "The jersey exceeded my expectations. The material is lightweight, breathable, and comfortable even when worn for several hours. I really like the bright yellow colour and the overall design, it looks even better in person.",
    hero: {
      src: "/images/review/aman.png",
      alt: "Aman wearing the yellow CSK fan jersey",
    },
    gallery: [
      { src: "/images/review/aman1.png", alt: "Front of the yellow CSK jersey" },
      { src: "/images/review/aman2.png", alt: "Sponsor logo printed on the chest" },
      { src: "/images/review/aman3.png", alt: "Back of the jersey, printed number 7" },
      { src: "/images/review/aman4.png", alt: "Sleeve and side-panel detail" },
    ],
    hasVideo: false,
    helpfulYes: 24,
    helpfulNo: 1,
    sizeBought: "M",
    purchasedOn: "18 Apr 2026",
    isVerifiedPurchase: true,
    productName: "CSK Jersey 2025",
    productCollection: "Official Fan Collection",
    postedLabel: "3 Weeks ago",
  },
  {
    id: "rohini-mehta",
    tabId: "football-jerseys",
    authorName: "Rohini Mehta",
    city: "Ahemdabad",
    rating: 4.5,
    title: "Premium Fit and Great Design",
    body:
      "The stitching, team badge, collar, and printed sponsor details are all finished neatly. I contacted customer support about the sizing, and they helped me choose the right one. Overall, I am very happy with the purchase and would recommend it to other cricket fans.",
    hero: {
      src: "/images/review/rohini.png",
      alt: "Rohini wearing the navy Gujarat Titans fan jersey",
    },
    gallery: [
      { src: "/images/review/rohini1.png", alt: "Front of the Gujarat Titans jersey" },
      { src: "/images/review/rohini2.png", alt: "Sponsor print across the chest" },
      { src: "/images/review/rohini3.png", alt: "Shoulder and sleeve trim" },
      { src: "/images/review/rohini4.png", alt: "Gujarat Titans crest close-up" },
      { src: "/images/review/rohini5.png", alt: "Back of the jersey, printed number 7" },
    ],
    hasVideo: false,
    helpfulYes: 24,
    helpfulNo: 1,
    sizeBought: "L",
    purchasedOn: "15 Apr 2026",
    isVerifiedPurchase: true,
    productName: "GT Titans Jersey 2025",
    productCollection: "Official Fan Collection",
    postedLabel: "1 Month ago",
  },
];

export const featuredReviews: FeaturedReview[] = [
  {
    id: "lalit-thakur",
    name: "Lalit Thakur",
    rating: 5,
    body:
      "I was surprised by the variety available! So many choices, and each one looked so appealing. I'll definitely be back to try more products!",
    image: {
      src: "/images/review/lalit.png",
      alt: "Lalit wearing a custom TeeHub football jersey",
      width: 274,
      height: 343,
    },
    cardWidth: 219,
  },
  {
    id: "richa-chaddha",
    name: "Richa chaddha",
    rating: 5,
    body:
      "I was initially skeptical, but this service surpassed my expectations. Everything was efficient, well-organized, and the quality was superb.",
    image: {
      src: "/images/review/richa.png",
      alt: "Richa wearing a black TeeHub polo",
      width: 274,
      height: 343,
    },
    // Her own photo doubles as the avatar; cropped to the top so the circle
    // lands on her face rather than the shirt.
    avatar: "/images/review/richa.png",
    cardWidth: 219,
  },
  {
    id: "ava-lewis",
    name: "Ava Lewis",
    rating: 5,
    body:
      "We bought it in bulk for a corporate event. For the price we paid, we got so much value! It's rare to find a place that combines quality and affordability like this. I highly recommend giving it a try! The delivery was on time. The best part we got it before our event.",
    image: {
      src: "/images/review/ava.png",
      alt: "A team in matching custom TeeHub event shirts",
      width: 522,
      height: 348,
    },
    cardWidth: 417,
  },
  {
    // PLACEHOLDER — the design's fourth card is a duplicate of Richa's review
    // sitting half off-canvas, and `richa-2.png` was exported cropped to 78px.
    // Reproduced here so the carousel matches the mock; replace the name, body
    // and image with a real fourth review when one is available.
    id: "featured-placeholder-4",
    name: "Richa chaddha",
    rating: 5,
    body:
      "I was initially skeptical, but this service surpassed my expectations. Everything was efficient, well-organized, and the quality was superb.",
    image: {
      src: "/images/review/richa-2.png",
      alt: "Customer photo",
      width: 78,
      height: 343,
    },
    cardWidth: 219,
  },
];
