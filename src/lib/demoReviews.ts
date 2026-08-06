import type { Review, ReviewSummary } from "@/lib/reviews";

/** Temporary review content used to build the product-page UI. */
export const demoProductReviews: {
  reviews: Review[];
  summary: ReviewSummary;
} = {
  summary: {
    average: 4.5,
    total: 102,
    verifiedTotal: 96,
    histogram: { 5: 68, 4: 18, 3: 8, 2: 5, 1: 3 },
    topFeatures: ["Color", "Comfort", "Quality", "Fit"],
    band: "Very good",
  },
  reviews: [
    {
      id: -1,
      authorName: "Sreeju Sharma",
      isVerifiedBuyer: true,
      rating: 4.9,
      body:
        "The quality is insane! Customized my own jersey and it turned out even better than I imagined. Super comfy, great fit, and the print is solid. Thanks TeeHub!",
      media: [
        {
          src: "/images/demo/1.png",
          alt: "Customer video review preview",
          isVideo: false,
        },
        {
          src: "/images/demo/2.png",
          alt: "Customer jersey photo",
          isVideo: false,
        },
        {
          src: "/images/demo/3.png",
          alt: "Customer wearing the jersey",
          isVideo: false,
        },
      ],
      featureTags: ["Color", "Comfort", "Quality", "Fit"],
      sizeBought: "L",
      purchasedAt: "2026-01-25T00:00:00.000Z",
      createdAt: "2026-04-06T00:00:00.000Z",
      helpfulCount: 4,
      notHelpfulCount: 0,
    },
  ],
};
