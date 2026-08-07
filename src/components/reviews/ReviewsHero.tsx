import Image from "next/image";
import { IconRosetteDiscountCheckFilled, IconStarFilled } from "@tabler/icons-react";
import Stars from "@/components/product/Stars";
import { REVIEWS_GUTTER } from "@/components/reviews/gutter";
import { reviewsHero, reviewsSummary } from "@/lib/reviewsPage";

/** Brand orange used across this page (headline accent, stars, bars, CTA). */
const ORANGE = "#f26522";

/** Column heading inside the stats card. */
function ColumnLabel({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <p
      className={`font-sfpro text-[clamp(9px,1.1vw,16px)] font-semibold uppercase tracking-[0.6px] text-[#111] ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

/**
 * The white stats card floating over the bottom of the hero: overall score, the
 * 5→1 histogram, per-aspect scores, and the verified-reviews seal.
 *
 * Four columns with hairline rules between them on desktop, collapsing to two
 * and then one as space runs out — the rules go with them, since a horizontal
 * stack of stacked columns reads fine without dividers.
 */
function RatingSummaryCard() {
  const { average, totalLabel, breakdown, categories, verifiedTitle, verifiedBody } =
    reviewsSummary;

  const columnRule =
    "lg:border-l lg:border-[#f26522]/30 lg:pl-[clamp(14px,3.4vw,49px)]";

  return (
    <div className="rounded-[clamp(12px,1.7vw,24px)] bg-white p-[clamp(20px,4.2vw,60px)] shadow-[0_18px_50px_rgba(0,0,0,0.13)]">
      <div className="grid grid-cols-1 gap-x-[clamp(14px,3.4vw,49px)] gap-y-9 sm:grid-cols-2 lg:grid-cols-[1fr_1.1fr_1.07fr_1.13fr]">
        {/* Overall rating */}
        <div className="flex flex-col items-center justify-center gap-[clamp(6px,0.9vw,13px)]">
          <ColumnLabel align="center">Overall Rating</ColumnLabel>

          <p className="font-sfpro leading-none text-[#111]">
            <span className="text-[clamp(22px,2.9vw,42px)] font-bold">
              {average.toFixed(1)}
            </span>
            <span className="text-[clamp(14px,1.8vw,26px)] font-medium">/5</span>
          </p>

          {/* `1em` stars, so the row scales with the card rather than sitting
              at a fixed pixel size while everything around it grows. */}
          <Stars
            rating={average}
            size="1em"
            color={ORANGE}
            className="text-[clamp(14px,2.2vw,31px)]"
          />

          <p className="font-sfpro text-[clamp(11px,1.3vw,19px)] font-medium text-[#111]">
            {totalLabel}
          </p>
        </div>

        {/* Rating breakdown */}
        <div className={`flex flex-col gap-[clamp(8px,1.2vw,17px)] ${columnRule}`}>
          <ColumnLabel>Rating Breakdown</ColumnLabel>

          <ul className="flex flex-col gap-[clamp(6px,0.8vw,11px)]">
            {breakdown.map((row) => (
              <li
                key={row.star}
                className="flex items-center gap-[clamp(5px,0.8vw,11px)] font-sfpro text-[clamp(9px,1vw,14px)] text-[#111]"
              >
                <span className="flex shrink-0 items-center gap-0.5">
                  {row.star}
                  <IconStarFilled size="1em" aria-hidden="true" style={{ color: ORANGE }} />
                </span>

                <span className="h-[clamp(3px,0.5vw,7px)] flex-1 overflow-hidden rounded-full bg-[#e9e9e9]">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${row.percent}%`, background: ORANGE }}
                  />
                </span>

                {/* Zero-padded and fixed-width so the figures stay flush. */}
                <span className="w-[clamp(22px,2.6vw,38px)] shrink-0 text-right">
                  {String(row.percent).padStart(2, "0")}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Category ratings */}
        <div className={`flex flex-col gap-[clamp(8px,1.2vw,17px)] ${columnRule}`}>
          <ColumnLabel>Category Ratings</ColumnLabel>

          <ul className="flex flex-col gap-[clamp(6px,0.8vw,11px)]">
            {categories.map((category) => (
              <li
                key={category.label}
                className="flex items-center justify-between gap-3 font-sfpro text-[clamp(9px,1vw,14px)]"
              >
                <span className="text-[#7a7a7a]">{category.label}</span>
                <span className="flex shrink-0 items-center gap-0.5 font-medium text-[#111]">
                  {category.score.toFixed(1)}
                  <IconStarFilled size="1em" aria-hidden="true" style={{ color: ORANGE }} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Verified seal */}
        <div
          className={`flex flex-col items-center justify-center gap-[clamp(6px,0.9vw,13px)] ${columnRule}`}
        >
          <IconRosetteDiscountCheckFilled
            size="1em"
            aria-hidden="true"
            className="text-[#1d9bf0]"
            style={{ fontSize: "clamp(36px,5.3vw,76px)" }}
          />
          <p className="font-sfpro text-[clamp(10px,1.2vw,17px)] font-bold uppercase tracking-[0.6px] text-[#111]">
            {verifiedTitle}
          </p>
          <p className="max-w-[22ch] text-center font-sfpro text-[clamp(9px,1vw,14px)] leading-[1.5] text-[#8a8a8a]">
            {verifiedBody}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Page hero: full-bleed stadium artwork with the headline over its flat left
 * side, and the stats card overlapping the bottom edge.
 *
 * The artwork's left third is deliberately flat dark, so the headline sits on
 * it unaided at desktop. The gradient below only matters on narrow viewports,
 * where `object-cover` pulls the players leftward under the text.
 */
export default function ReviewsHero() {
  return (
    <section>
      {/* Height comes from the artwork's own 1440x646 ratio rather than a
          clamp, so the full frame is always visible — capping the height meant
          `object-cover` had to crop the difference vertically, and at wide
          viewports that took the players' heads off. `min-h` only engages on
          phones, where the ratio alone would leave no room for the headline;
          that is the one case anything is cropped, and it crops the sides. */}
      {/* `min-h-[380px]` stays an arbitrary value on purpose — the `min-h-95`
          spacing-scale form this project's Tailwind offers emits no rule. */}
      <div className="relative aspect-1440/646 min-h-[380px] w-full overflow-hidden bg-[#0f1317]">
        <Image
          src={reviewsHero.background}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom-right"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-r from-[#0f1317] via-[#0f1317]/70 to-transparent lg:via-[#0f1317]/25"
        />

        {/* Sits above centre, matching the mock — the card takes the lower third. */}
        <div
          className={`relative flex h-full flex-col justify-center pb-[clamp(40px,9vw,130px)] ${REVIEWS_GUTTER}`}
        >
          <p
            className="font-bebas text-[clamp(11px,1.3vw,19px)] tracking-[1.6px]"
            style={{ color: ORANGE }}
          >
            {reviewsHero.eyebrow}
          </p>

          <h1 className="font-bebas text-[clamp(38px,7vw,96px)] leading-[1.05] tracking-[0.5px]">
            <span className="block text-white">{reviewsHero.headline}</span>
            <span className="block" style={{ color: ORANGE }}>
              {reviewsHero.headlineAccent}
            </span>
          </h1>

          <span
            aria-hidden="true"
            className="mt-[clamp(8px,1.3vw,19px)] block h-[clamp(3px,0.5vw,7px)] w-[clamp(90px,14.7vw,212px)] rounded-full"
            style={{ background: ORANGE }}
          />
        </div>
      </div>

      {/* Overlap is a share of the viewport, like every other measure here, so
          the card keeps the same relationship to the artwork as the page
          scales. */}
      <div className={`relative -mt-[clamp(40px,9.6vw,260px)] ${REVIEWS_GUTTER}`}>
        <RatingSummaryCard />
      </div>
    </section>
  );
}
