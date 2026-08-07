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

/** Design-scale height every card image is drawn at; widths follow from it. */
export const FEATURED_IMAGE_HEIGHT = 274;

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
