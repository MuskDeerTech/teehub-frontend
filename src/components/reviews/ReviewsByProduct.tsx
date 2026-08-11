"use client";

import Image from "next/image";
import { useState } from "react";
import {
  IconCalendar,
  IconPhoto,
  IconPhotoFilled,
  IconPlayerPlayFilled,
  IconRosetteDiscountCheck,
  IconShieldCheck,
  IconShieldCheckFilled,
  IconStar,
  IconTag,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import Stars from "@/components/product/Stars";
import { REVIEWS_GUTTER } from "@/components/reviews/gutter";
import {
  ALL_REVIEWS_LABEL,
  REVIEWS_SORT_LABEL,
  productReviews,
  reviewProductTabs,
  type ProductReview,
  type ReviewFilterId,
  type ReviewMedia,
} from "@/lib/reviewsPage";

/** Brand orange — same value the hero and featured row use. */
const ORANGE = "#f26522";

/**
 * The design's type ramp, as clamps.
 *
 * Each maximum is the Figma value at the 1440 design width and the `vw` figure
 * is that value over 1440, so the whole block scales with the page exactly like
 * the hero and featured row above it. The minimums only stop the text
 * collapsing on phones.
 */
const TEXT_40 = "text-[clamp(22px,2.78vw,40px)]"; // section heading
const TEXT_16 = "text-[clamp(11px,1.11vw,16px)]"; // tabs, filters, title, body
const TEXT_14 = "text-[clamp(10px,0.97vw,14px)]"; // reviewer name, helpful row
const TEXT_13 = "text-[clamp(9.5px,0.9vw,13px)]"; // right-panel detail rows
const TEXT_12 = "text-[clamp(9px,0.85vw,12.21px)]"; // verified-purchase pill

/** Accent rule separating the right-hand meta panel from the write-up. */
const RULE = "border-[#f26522]/45";

/** Thumbnails that stay fully visible; a strip longer than this puts the count
 *  overlay on the tile after them. */
const VISIBLE_THUMBS = 4;

const FILTERS: { id: ReviewFilterId; label: string }[] = [
  // The figure is the store-wide total, not the length of the sample below.
  { id: "all", label: `All Reviews (${ALL_REVIEWS_LABEL})` },
  { id: "verified", label: "Verified Purchase" },
  { id: "photos", label: "With Photos" },
  { id: "videos", label: "With Videos" },
];

function matchesFilter(review: ProductReview, filter: ReviewFilterId): boolean {
  switch (filter) {
    case "verified":
      return review.isVerifiedPurchase;
    case "photos":
      return review.gallery.length > 0;
    case "videos":
      return review.hasVideo;
    default:
      return true;
  }
}

/** Orange outline pill in the top-right of a review. */
function VerifiedPill() {
  return (
    <span
      className={`flex shrink-0 items-center gap-[0.42em] rounded-full border px-[1.05em] py-[0.45em] font-sans ${TEXT_12} leading-none`}
      style={{ borderColor: ORANGE, color: ORANGE }}
    >
      <IconRosetteDiscountCheck size="1.25em" stroke={1.8} aria-hidden="true" />
      Verified Purchase
    </span>
  );
}

/**
 * The customer's uploads. Four tiles read normally and a fifth carries the
 * "+N more" overlay, so a long strip never pushes the row wider than the
 * column — the count tells the shopper what they aren't seeing.
 */
function ThumbnailStrip({ gallery }: { gallery: ReviewMedia[] }) {
  if (gallery.length === 0) return null;

  const tiles = gallery.slice(0, VISIBLE_THUMBS + 1);
  const remaining = gallery.length - VISIBLE_THUMBS;

  return (
    <ul className="mt-[clamp(10px,1.5vw,21px)] flex flex-wrap gap-[clamp(6px,1.4vw,20px)]">
      {tiles.map((media, index) => {
        const isOverflowTile = remaining > 0 && index === VISIBLE_THUMBS;

        return (
          <li
            key={media.src}
            className="relative aspect-107/90 w-[clamp(50px,7.43vw,107px)] shrink-0 overflow-hidden rounded-[clamp(3px,0.42vw,6px)] bg-[#f2f2f2]"
          >
            <Image
              src={media.src}
              // The overflow tile is a counter first and a picture second, so
              // its own alt text would only add noise to the row.
              alt={isOverflowTile ? "" : media.alt}
              fill
              sizes="(max-width: 1024px) 22vw, 107px"
              className="object-cover"
            />

            {isOverflowTile && (
              <span
                className={`absolute inset-0 flex flex-col items-center justify-center gap-[0.3em] bg-black/55 px-1 text-center font-sans ${TEXT_12} font-semibold leading-tight text-white`}
              >
                <IconPhoto size="1.6em" stroke={1.8} aria-hidden="true" />
                +{remaining} more
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** One `icon — label — value` line in the right-hand panel. `sub` sits under
 *  the value rather than the label, which is how the design indents it. */
function MetaRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof IconTag;
  label: string;
  value?: string;
  sub?: string;
}) {
  return (
    <li className="flex items-start gap-[0.6em]">
      <Icon
        size="1.28em"
        stroke={1.7}
        aria-hidden="true"
        className="mt-[0.1em] shrink-0 text-[#7c7c7c]"
      />

      <span className="shrink-0 text-[#6b6b6b]">{label}</span>

      {value && (
        <span className="min-w-0">
          <span className="block text-[#111]">{value}</span>
          {sub && <span className="mt-[0.2em] block text-[#a3a3a3]">{sub}</span>}
        </span>
      )}
    </li>
  );
}

/**
 * One review: the customer's photo, their write-up and uploads, and a meta
 * panel down the right-hand side.
 *
 * Three columns on desktop, stacking to one when the middle column would get
 * too narrow to hold a readable line. The panel's rule turns from a vertical
 * one into a horizontal one on the way down, so it still reads as its own
 * block once it sits underneath the write-up.
 */
function ReviewRow({ review }: { review: ProductReview }) {
  return (
    <article
      className="flex flex-col gap-[clamp(14px,2vw,28px)] lg:grid lg:grid-cols-[clamp(150px,18.2vw,262px)_minmax(0,1fr)_clamp(170px,17.4vw,250px)] lg:gap-x-[clamp(14px,2.2vw,32px)]"
    >
      <div className="relative aspect-262/292 w-[min(200px,52vw)] shrink-0 overflow-hidden rounded-[clamp(4px,0.5vw,7px)] bg-[#f2f2f2] lg:w-full">
        <Image
          src={review.hero.src}
          alt={review.hero.alt}
          fill
          sizes="(max-width: 1024px) 52vw, 262px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-[clamp(8px,1.2vw,17px)]">
          <Stars
            rating={review.rating}
            size="1em"
            color={ORANGE}
            className="text-[clamp(15px,1.95vw,28px)]"
          />
          {review.isVerifiedPurchase && <VerifiedPill />}
        </div>

        <h3
          className={`mt-[clamp(8px,1.2vw,17px)] font-sans ${TEXT_16} font-extrabold text-[#111]`}
        >
          {review.title}
        </h3>

        <p
          className={`mt-[clamp(5px,0.75vw,11px)] font-sans ${TEXT_16} leading-[1.5] text-[#4f4f4f]`}
        >
          {review.body}
        </p>

        <ThumbnailStrip gallery={review.gallery} />

        {/* Read-only counts, following the product-page review card: there's no
            vote endpoint yet, and a button that silently does nothing is worse
            than a plain figure. They become buttons when the route ships. */}
        <div
          className={`mt-[clamp(10px,1.45vw,21px)] flex flex-wrap items-center gap-[clamp(9px,1.4vw,20px)] font-sans ${TEXT_14} font-semibold`}
        >
          <span className="text-[#8a8a8a]">Was this helpful?</span>

          <span className="flex items-center gap-[0.4em] text-[#111]">
            <IconThumbUp size="1.2em" stroke={1.8} aria-hidden="true" />
            Yes ({review.helpfulYes})
          </span>

          <span className="flex items-center gap-[0.4em] text-[#111]">
            <IconThumbDown size="1.2em" stroke={1.8} aria-hidden="true" />
            No ({review.helpfulNo})
          </span>
        </div>
      </div>

      <aside
        className={`border-t ${RULE} pt-[clamp(12px,1.6vw,22px)] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-[clamp(14px,2.2vw,32px)]`}
      >
        <div className="flex items-center gap-[clamp(7px,1vw,14px)]">
          <span
            aria-hidden="true"
            className={`flex aspect-square w-[clamp(26px,3.05vw,44px)] shrink-0 items-center justify-center rounded-full font-sans ${TEXT_16} font-semibold leading-none text-white`}
            style={{ background: ORANGE }}
          >
            {review.authorName.charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0">
            <p className={`truncate font-sans ${TEXT_14} font-bold text-[#111]`}>
              {review.authorName}
            </p>
            <p
              className={`truncate font-sans ${TEXT_13} font-medium text-[#8a8a8a]`}
            >
              {review.city}
            </p>
          </div>
        </div>

        <ul
          className={`mt-[clamp(12px,1.75vw,25px)] flex flex-col gap-[clamp(8px,1.15vw,16px)] font-sans ${TEXT_13} font-medium`}
        >
          <MetaRow icon={IconTag} label="Size Bought" value={review.sizeBought} />
          <MetaRow
            icon={IconCalendar}
            label="Purchased on"
            value={review.purchasedOn}
          />
          {review.isVerifiedPurchase && (
            <MetaRow icon={IconShieldCheck} label="Verified Purchase" />
          )}
          <MetaRow
            icon={IconStar}
            label="Product"
            value={review.productName}
            sub={review.productCollection}
          />
        </ul>

        <p
          className={`mt-[clamp(12px,1.75vw,25px)] font-sans ${TEXT_13} font-medium text-[#9a9a9a]`}
        >
          {review.postedLabel}
        </p>
      </aside>
    </article>
  );
}

/**
 * "Reviews by Product" — the product tab strip, the filter chips, and the
 * review list underneath them.
 *
 * A client component because the tabs and chips are real controls: each one
 * narrows `productReviews` by a field the type already carries, so none of them
 * is decorative. "All Reviews" is the reset and deliberately renders in the
 * neutral chip style, which is why the section's initial paint matches the
 * design exactly rather than opening with one chip already highlighted.
 */
export default function ReviewsByProduct() {
  const [activeTab, setActiveTab] = useState(reviewProductTabs[0].id);
  const [activeFilter, setActiveFilter] = useState<ReviewFilterId>("all");

  const visible = productReviews.filter(
    (review) => review.tabId === activeTab && matchesFilter(review, activeFilter),
  );

  return (
    <section className={`pb-[clamp(32px,5.4vw,78px)] ${REVIEWS_GUTTER}`}>
      <h2
        className={`font-sfpro ${TEXT_40} font-bold uppercase tracking-[0.2px] text-[#111]`}
      >
        Reviews by Product
      </h2>

      {/* Scrolls rather than wraps on narrow viewports — a tab strip that folds
          onto two lines stops reading as one row of tabs. */}
      <div
        className="scrollbar-hide mt-[clamp(18px,2.8vw,40px)] overflow-x-auto border-b border-[#e5e5e5]"
        role="tablist"
        aria-label="Reviews by product category"
      >
        <div className="flex w-max min-w-full gap-[clamp(4px,0.85vw,12px)]">
          {reviewProductTabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                // `-mb-px` lifts the active underline over the strip's own
                // hairline instead of stacking the two.
                className={`-mb-px flex shrink-0 cursor-pointer items-center gap-[clamp(5px,0.7vw,10px)] whitespace-nowrap border-b-[3px] px-[clamp(8px,1.25vw,18px)] py-[clamp(8px,1.1vw,16px)] font-sans ${TEXT_16} font-extrabold uppercase tracking-[0.2px] text-[#111] transition-colors ${
                  isActive
                    ? "border-[#f26522] bg-[#f4f4f4]"
                    : "border-transparent hover:bg-[#fafafa]"
                }`}
              >
                {/* Decorative: the label beside it carries the meaning. */}
                <Image
                  src={tab.icon}
                  alt=""
                  width={32}
                  height={32}
                  className="h-auto w-[clamp(15px,1.7vw,24px)] shrink-0"
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="mt-[clamp(16px,2.6vw,38px)] flex flex-wrap items-center justify-between gap-[clamp(8px,1.2vw,17px)]"
      >
        <div className="flex flex-wrap gap-[clamp(7px,1vw,15px)]">
          {FILTERS.map((filter) => {
            // "All" is the resting state, so it never lights up — only a chip
            // that is actually narrowing the list gets the active treatment.
            const isActive = filter.id !== "all" && filter.id === activeFilter;

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={filter.id === activeFilter}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex cursor-pointer items-center gap-[0.5em] rounded-[clamp(4px,0.49vw,7px)] border px-[clamp(9px,1.1vw,16px)] py-[clamp(5px,0.62vw,9px)] font-sans ${TEXT_16} text-[#111] transition-colors ${
                  isActive
                    ? "border-[#f26522] bg-[#fff4ef]"
                    : "border-[#d9d9d9] bg-white hover:border-[#b4b4b4]"
                }`}
              >
                {filter.id === "verified" && (
                  <IconShieldCheckFilled size="1.05em" aria-hidden="true" />
                )}
                {filter.id === "photos" && (
                  <IconPhotoFilled size="1.05em" aria-hidden="true" />
                )}
                {filter.id === "videos" && (
                  <span
                    aria-hidden="true"
                    className="flex aspect-square w-[1.05em] items-center justify-center rounded-full bg-[#111] text-white"
                  >
                    <IconPlayerPlayFilled size="0.55em" />
                  </span>
                )}
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* A label, not a menu: there is one ordering, and the list is already
            authored in it. */}
        <span
          className={`rounded-[clamp(4px,0.49vw,7px)] border border-[#d9d9d9] px-[clamp(9px,1.1vw,16px)] py-[clamp(5px,0.62vw,9px)] font-sans ${TEXT_16} text-[#111]`}
        >
          {REVIEWS_SORT_LABEL}
        </span>
      </div>

      <div className="mt-[clamp(20px,3.2vw,46px)] flex flex-col gap-[clamp(24px,3.3vw,47px)]">
        {visible.length > 0 ? (
          visible.map((review) => <ReviewRow key={review.id} review={review} />)
        ) : (
          <p
            className={`py-[clamp(20px,3vw,43px)] font-sans ${TEXT_16} text-[#8a8a8a]`}
          >
            No reviews here yet — try another category or clear the filter.
          </p>
        )}
      </div>
    </section>
  );
}
