import { IconArrowUpRight } from "@tabler/icons-react";
import Stars from "@/components/product/Stars";
import ReviewCard from "@/components/product/ReviewCard";
import type { Review, ReviewSummary } from "@/lib/reviews";

/** 5→1, so the histogram reads top-down like the design. */
const STAR_ROWS = [5, 4, 3, 2, 1] as const;

/**
 * Ratings and Reviews, sitting under the gallery. Server-rendered and passed
 * into ProductDetails as a slot, so the reviews query stays on the server while
 * the interactive buy panel beside it stays a client component.
 *
 * Renders nothing at all when a product has no published reviews — an empty
 * histogram beside a 0.0 score reads as a bad product rather than a new one.
 */
export default function ReviewsSection({
  reviews,
  summary,
}: {
  reviews: Review[];
  summary: ReviewSummary;
}) {
  if (summary.total === 0) return null;

  return (
    <section className="mt-4 rounded-xl border border-[#e2e2e2] bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: heading, attribution, feature chips */}
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-semibold text-[#111]">
            Ratings and Reviews
          </h2>

          <p className="mt-1 text-[12px] text-[#6b6b6b]">
            Based on {summary.total} rating{summary.total === 1 ? "" : "s"}
            {summary.verifiedTotal > 0 && (
              <>
                {" by "}
                <span className="font-medium text-[#0f7a45] underline underline-offset-2">
                  verified
                </span>
                {" buyers."}
              </>
            )}
            {summary.verifiedTotal === 0 && "."}
          </p>

          {summary.topFeatures.length > 0 && (
            <>
              <p className="mt-4 text-[12px] font-medium text-[#111]">
                Features customers liked
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {summary.topFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-1 rounded-md border border-[#dcdcdc] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#444]"
                  >
                    {feature}
                    <IconArrowUpRight
                      size={12}
                      stroke={2}
                      aria-hidden="true"
                      className="text-[#0f7a45]"
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Right: histogram + aggregate score */}
        <div className="flex shrink-0 items-center gap-5">
          <ul className="flex w-[150px] flex-col gap-1.5 sm:w-[190px]">
            {STAR_ROWS.map((star) => {
              const count = summary.histogram[star];
              // Bars are scaled against the whole set, so the row lengths stay
              // comparable rather than always filling to the biggest bucket.
              const percent = Math.round((count / summary.total) * 100);
              return (
                <li key={star} className="flex items-center gap-2">
                  <span className="w-2 text-[11px] text-[#8a8a8a]">{star}</span>
                  <span className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#efefef]">
                    <span
                      className="block h-full rounded-full bg-[#ff5b1f]"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col items-center gap-1 border-l border-[#ededed] pl-5">
            <span className="text-[34px] font-semibold leading-none text-[#111]">
              {summary.average.toFixed(1)}
            </span>
            <Stars rating={summary.average} size={13} />
            <span className="mt-0.5 rounded bg-[#0f7a45] px-2 py-0.5 text-[10px] font-medium text-white">
              {summary.band}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-[#ededed] pt-1">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
