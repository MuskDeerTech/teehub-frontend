"use client";

import Image from "next/image";
import Link from "next/link";
import { IconClock, IconPlayerPlayFilled, IconUsers } from "@tabler/icons-react";
import { CarouselDots, useCarouselDots } from "@/components/reviews/carousel";
import { REVIEWS_GUTTER } from "@/components/reviews/gutter";
import { videoTestimonials, type VideoTestimonial } from "@/lib/reviewsPage";

const ORANGE = "#f26522";

const TEXT_40 = "text-[clamp(22px,2.78vw,40px)]"; // section heading (SF Pro)
const TEXT_14 = "text-[clamp(10px,0.97vw,14px)]"; // card title
const TEXT_13 = "text-[clamp(9.5px,0.9vw,13px)]"; // tagline, CTA
const TEXT_11 = "text-[clamp(8.5px,0.76vw,11px)]"; // duration / audience meta

/** Duration and audience, split by a hairline like the design. */
function CardMeta({ video }: { video: VideoTestimonial }) {
  return (
    <div
      className={`mt-[clamp(6px,0.83vw,12px)] flex items-center font-sans ${TEXT_11} font-medium text-white/85`}
    >
      <span className="flex items-center gap-[0.45em]">
        <IconClock size="1.25em" stroke={1.9} aria-hidden="true" style={{ color: ORANGE }} />
        {video.durationLabel}
      </span>

      <span
        aria-hidden="true"
        className="mx-[clamp(8px,1.1vw,16px)] h-[1em] w-px bg-white/25"
      />

      <span className="flex items-center gap-[0.45em]">
        <IconUsers size="1.25em" stroke={1.9} aria-hidden="true" />
        {video.audienceLabel}
      </span>
    </div>
  );
}

/**
 * One testimonial tile: poster art, a play affordance, and the caption block
 * over the bottom edge.
 *
 * The circle is drawn here rather than being baked into the poster — the three
 * poster PNGs are plain photos, so without it the tile reads as a still image.
 * Not a link either, since the films aren't cut yet; wrap it once they land.
 */
function VideoCard({
  video,
  ref,
}: {
  video: VideoTestimonial;
  ref?: React.Ref<HTMLElement>;
}) {
  return (
    <article
      ref={ref}
      className="relative aspect-412/246 w-[min(412px,84vw)] shrink-0 snap-start overflow-hidden rounded-[clamp(6px,0.83vw,12px)] bg-[#111] lg:w-auto lg:flex-1"
    >
      <Image
        src={video.poster.src}
        alt={video.poster.alt}
        fill
        sizes="(max-width: 1024px) 84vw, 412px"
        className="object-cover"
      />

      {/* Two stops rather than one: the caption needs a solid footing while the
          faces in the upper half stay unclouded. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent"
      />

      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 flex aspect-square w-[clamp(34px,3.9vw,56px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 text-white"
        // Font size matches the circle so the triangle scales with it instead
        // of staying pinned to the inherited body size.
        style={{ fontSize: "clamp(34px,3.9vw,56px)" }}
      >
        {/* Nudged right so the triangle looks centred rather than measuring so. */}
        <IconPlayerPlayFilled size="0.34em" className="ml-[0.03em]" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-[clamp(8px,1.1vw,16px)]">
        <div className="flex gap-[clamp(6px,0.83vw,12px)]">
          <span
            aria-hidden="true"
            className="w-[clamp(2px,0.21vw,3px)] shrink-0 rounded-full"
            style={{ background: ORANGE }}
          />

          <div className="min-w-0">
            <h3
              className={`font-sans ${TEXT_14} font-bold uppercase tracking-[0.3px] text-white`}
            >
              {video.title}
            </h3>
            <p className={`mt-[0.2em] font-sans ${TEXT_13} text-white/85`}>
              {video.tagline}
            </p>
          </div>
        </div>

        <CardMeta video={video} />
      </div>
    </article>
  );
}

/**
 * "Video Testimonials" — three poster tiles with the dot row under them.
 *
 * All three fit at desktop, so the track only actually scrolls on narrower
 * viewports; the dots track it either way and stay usable as direct jumps.
 */
export default function VideoTestimonials() {
  const { trackRef, setCardRef, activeIndex, handleScroll, scrollTo } =
    useCarouselDots<HTMLElement>();

  return (
    <section className={`pb-[clamp(32px,5.4vw,78px)] ${REVIEWS_GUTTER}`}>
      <div className="flex items-center justify-between gap-4">
        <h2
          className={`font-sfpro ${TEXT_40} font-bold uppercase tracking-[0.2px] text-[#111]`}
        >
          Video Testimonials
        </h2>

        <Link
          href="/all/"
          className={`shrink-0 rounded-full px-[clamp(16px,2.4vw,35px)] py-[clamp(8px,1.15vw,17px)] font-sans ${TEXT_13} font-semibold uppercase tracking-[0.5px] text-white transition-opacity hover:opacity-90`}
          style={{ background: ORANGE }}
        >
          Discover More
        </Link>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="scrollbar-hide mt-[clamp(18px,3vw,43px)] flex snap-x snap-mandatory gap-[clamp(10px,1.25vw,18px)] overflow-x-auto"
      >
        {videoTestimonials.map((video, index) => (
          <VideoCard key={video.id} video={video} ref={setCardRef(index)} />
        ))}
      </div>

      <CarouselDots
        count={videoTestimonials.length}
        activeIndex={activeIndex}
        onSelect={scrollTo}
        className="mt-[clamp(14px,2.2vw,32px)]"
      />
    </section>
  );
}
