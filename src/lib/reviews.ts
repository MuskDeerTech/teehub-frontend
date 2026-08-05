/**
 * Reads published product reviews and derives everything the Ratings & Reviews
 * section shows: the 5→1 histogram, the mean score, the verified-buyer count and
 * the ranked "Features customers liked" chips.
 *
 * The aggregates are computed here rather than stored on the product so they can
 * never drift from the underlying rows — a review being published, edited or
 * pulled updates the summary for free.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { Media, Review as ReviewDoc } from "../../payload-types";

/** Aspects a reviewer can call out. Mirrors the `featureTags` options. */
export const REVIEW_FEATURES = ["Color", "Comfort", "Quality", "Fit"] as const;
export type ReviewFeature = (typeof REVIEW_FEATURES)[number];

export type ReviewMedia = {
  src: string;
  alt: string;
  /** Drives the play overlay on the thumbnail. */
  isVideo: boolean;
};

export type Review = {
  id: number;
  authorName: string;
  isVerifiedBuyer: boolean;
  rating: number;
  body: string;
  media: ReviewMedia[];
  featureTags: ReviewFeature[];
  sizeBought?: string;
  /** ISO string; formatted in the component so the server sets the timezone. */
  purchasedAt?: string;
  createdAt: string;
  helpfulCount: number;
  notHelpfulCount: number;
};

export type ReviewSummary = {
  /** Mean rating to one decimal, e.g. 4.5. Zero when there are no reviews. */
  average: number;
  total: number;
  verifiedTotal: number;
  /** Counts keyed by whole star, 1–5. Every key is always present. */
  histogram: Record<1 | 2 | 3 | 4 | 5, number>;
  /** Features ordered by how often reviewers mentioned them, most first. */
  topFeatures: ReviewFeature[];
  /** "Very good" / "Excellent" … the band shown under the score. */
  band: string;
};

const REVIEW_LIMIT = 50;

/** Word for a score, matching the green pill in the design. */
function scoreBand(average: number): string {
  if (average >= 4.5) return "Excellent";
  if (average >= 4) return "Very good";
  if (average >= 3) return "Good";
  if (average >= 2) return "Fair";
  return "Poor";
}

/** Uploads resolve to objects at depth ≥ 1; bare ids are skipped. */
function toReviewMedia(media: ReviewDoc["media"]): ReviewMedia[] {
  return (media ?? [])
    .filter((m): m is Media => typeof m === "object" && m !== null)
    .filter((m) => Boolean(m.url))
    .map((m) => ({
      src: m.url as string,
      alt: m.alt || "Customer photo",
      isVideo: (m.mimeType ?? "").startsWith("video/"),
    }));
}

function toReview(doc: ReviewDoc): Review {
  return {
    id: doc.id,
    authorName: doc.authorName,
    isVerifiedBuyer: doc.isVerifiedBuyer ?? false,
    rating: doc.rating,
    body: doc.body,
    media: toReviewMedia(doc.media),
    featureTags: (doc.featureTags ?? []) as ReviewFeature[],
    sizeBought: doc.sizeBought ?? undefined,
    purchasedAt: doc.purchasedAt ?? undefined,
    createdAt: doc.createdAt,
    helpfulCount: doc.helpfulCount ?? 0,
    notHelpfulCount: doc.notHelpfulCount ?? 0,
  };
}

/** The empty state — lets callers render "no reviews yet" without null checks. */
export function emptySummary(): ReviewSummary {
  return {
    average: 0,
    total: 0,
    verifiedTotal: 0,
    histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    topFeatures: [],
    band: "",
  };
}

export function summarise(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) return emptySummary();

  const histogram: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const featureCounts = new Map<ReviewFeature, number>();
  let sum = 0;
  let verifiedTotal = 0;

  for (const review of reviews) {
    sum += review.rating;
    if (review.isVerifiedBuyer) verifiedTotal += 1;

    // Half stars round to the nearer whole bar; the mean keeps full precision.
    const bucket = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    histogram[bucket] += 1;

    for (const tag of review.featureTags) {
      featureCounts.set(tag, (featureCounts.get(tag) ?? 0) + 1);
    }
  }

  const average = Math.round((sum / reviews.length) * 10) / 10;

  return {
    average,
    total: reviews.length,
    verifiedTotal,
    histogram,
    // Ties fall back to the canonical order so the chip row is stable between
    // renders rather than reshuffling on equal counts.
    topFeatures: [...featureCounts.entries()]
      .sort((a, b) => b[1] - a[1] || REVIEW_FEATURES.indexOf(a[0]) - REVIEW_FEATURES.indexOf(b[0]))
      .map(([feature]) => feature),
    band: scoreBand(average),
  };
}

/**
 * Published reviews for a product, newest first, with their summary. Keyed by
 * slug — the same relationship-subfield join `catalog.ts` uses for categories —
 * so callers can pass the value straight off the route params.
 */
export async function getProductReviews(
  slug: string,
  limit = REVIEW_LIMIT,
): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "reviews",
    where: {
      and: [
        { isPublished: { equals: true } },
        { "product.slug": { equals: slug } },
      ],
    },
    sort: "-createdAt",
    depth: 1,
    limit,
  });

  const reviews = res.docs.map(toReview);
  return { reviews, summary: summarise(reviews) };
}
