"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import Stars from "@/components/product/Stars";
import { REVIEWS_GUTTER } from "@/components/reviews/gutter";
import { FEATURED_IMAGE_HEIGHT, type FeaturedReview } from "@/lib/reviewsPage";

const ORANGE = "#f26522";

/** Avatar tile: the customer's own photo when there is one, their initial on a
 *  solid orange circle otherwise. Sized off the card so it scales with it. */
function Avatar({ review }: { review: FeaturedReview }) {
  const size = { width: "var(--avatar)", height: "var(--avatar)" };

  if (review.avatar) {
    return (
      <span
        className="relative shrink-0 overflow-hidden rounded-full bg-[#f2f2f2]"
        style={size}
      >
        <Image
          src={review.avatar}
          alt=""
          fill
          sizes="40px"
          // Cropped to the top of the portrait so the circle lands on the face.
          className="object-cover object-top"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full font-roboto font-semibold leading-none text-white"
      style={{ ...size, background: ORANGE, fontSize: "calc(var(--avatar) * 0.45)" }}
    >
      {review.name.charAt(0).toUpperCase()}
    </span>
  );
}

function ReviewCard({
  review,
  ref,
}: {
  review: FeaturedReview;
  /** React 19 passes `ref` as a plain prop — the track measures `offsetLeft`
   *  off the card itself to drive the dots. */
  ref?: React.Ref<HTMLElement>;
}) {
  return (
    <article
      ref={ref}
      className="w-[calc(var(--img-h)*var(--ratio))] shrink-0 snap-start"
      style={
        {
          "--img-h": "clamp(200px, 23.3vw, 336px)",
          "--avatar": "clamp(22px, 2.65vw, 38px)",
          // Card width follows the image's rendered aspect, which is how the
          // design gets a wide group photo beside narrow portraits.
          "--ratio": review.cardWidth / FEATURED_IMAGE_HEIGHT,
        } as CSSProperties
      }
    >
      <div className="relative h-[var(--img-h)] w-full overflow-hidden rounded-[clamp(6px,0.9vw,13px)] bg-[#f2f2f2]">
        <Image
          src={review.image.src}
          alt={review.image.alt}
          fill
          sizes="(max-width: 1024px) 60vw, 420px"
          className="object-cover"
        />
      </div>

      <div className="mt-[clamp(8px,1.4vw,20px)] flex items-center gap-[clamp(6px,0.9vw,13px)]">
        <Avatar review={review} />
        <div className="min-w-0">
          <p className="truncate font-roboto text-[clamp(9px,1.1vw,15px)] font-semibold text-[#111]">
            {review.name}
          </p>
          <Stars
            rating={review.rating}
            size="1em"
            color={ORANGE}
            className="text-[clamp(9px,1.1vw,15px)]"
          />
        </div>
      </div>

      <p className="mt-[clamp(6px,0.9vw,13px)] font-sans text-[clamp(9px,1.1vw,15px)] leading-[1.6] text-[#6b6b6b]">
        {review.body}
      </p>
    </article>
  );
}

/**
 * "Featured Reviews" — a horizontally scrollable row of customer photo cards.
 *
 * Native scroll-snap rather than a JS slider: the cards are different widths,
 * so letting the browser own the scrolling keeps trackpad, touch and keyboard
 * behaviour correct for free. The dots read the scroll position back out and
 * can drive it.
 */
export default function FeaturedReviews({
  reviews,
}: {
  reviews: FeaturedReview[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  /** The card whose left edge sits nearest the track's current scroll offset. */
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    let nearest = 0;
    let smallest = Infinity;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const distance = Math.abs(card.offsetLeft - track.scrollLeft);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  };

  const scrollTo = (index: number) => {
    const card = cardRefs.current[index];
    const track = trackRef.current;
    if (!card || !track) return;
    track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  };

  return (
    <section className={`py-[clamp(32px,5.4vw,78px)] ${REVIEWS_GUTTER}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-sfpro text-[clamp(18px,2.65vw,38px)] font-bold uppercase tracking-[0.2px] text-[#111]">
          Featured Reviews
        </h2>

        <Link
          href="/all/"
          className="shrink-0 rounded-full px-[clamp(14px,2.2vw,32px)] py-[clamp(7px,1.1vw,16px)] font-sans text-[clamp(9px,1.1vw,15px)] font-semibold uppercase tracking-[0.5px] text-white transition-opacity hover:opacity-90"
          style={{ background: ORANGE }}
        >
          Discover More
        </Link>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="scrollbar-hide mt-[clamp(18px,3vw,43px)] flex snap-x snap-mandatory gap-[clamp(12px,2.4vw,35px)] overflow-x-auto"
      >
        {reviews.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
          />
        ))}
      </div>

      <div className="mt-[clamp(18px,2.6vw,38px)] flex items-center justify-center gap-2">
        {reviews.map((review, index) => (
          <button
            key={review.id}
            type="button"
            aria-label={`Go to review ${index + 1}`}
            aria-current={index === activeIndex}
            onClick={() => scrollTo(index)}
            className={`h-2 cursor-pointer rounded-full transition-all ${
              index === activeIndex ? "w-5 bg-[#111]" : "w-2 bg-[#d9d9d9]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
