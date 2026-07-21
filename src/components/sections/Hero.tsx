"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Dots from "@/components/ui/Dots";
import { SearchIcon } from "@/components/ui/icons";
import { useSearch } from "@/components/providers/SearchProvider";
import type { HomepageHero } from "@/lib/homepage";
import { categoryList, teamBanner } from "@/lib/products";

const SLIDE_MS = 600;

// Shared style for the hero's "View all" + category pills.
const PILL_CLASS =
  "cursor-pointer whitespace-nowrap rounded-full border border-white/40 bg-transparent px-5 py-2.5 text-[12px] font-bold tracking-[1px] text-white backdrop-blur-[10px] transition-colors duration-200 hover:bg-white hover:text-black";

// Which slide an animating layer is and where it's heading, mapped to the
// keyframes defined in globals.css.
const SLIDE_ANIM: Record<"forward" | "backward", { in: string; out: string }> = {
  forward: { in: "hero-in-right", out: "hero-out-left" },
  backward: { in: "hero-in-left", out: "hero-out-right" },
};

export default function Hero({ hero }: { hero: HomepageHero }) {
  const { openSearch } = useSearch();
  // Default to RCB so the initial window shows MI · RCB · CSK.
  const [activeIndex, setActiveIndex] = useState(1);
  // While set, the background is mid-slide: `from` leaves, `to` enters.
  const [transition, setTransition] = useState<{
    from: number;
    dir: "forward" | "backward";
  } | null>(null);

  const teams = hero.teams;
  const teamCount = teams.length;
  const activeTeamIndex = activeIndex % teamCount;
  const prevIndex = (activeTeamIndex - 1 + teamCount) % teamCount;
  const nextIndex = (activeTeamIndex + 1) % teamCount;

  // Fixed 4 dots that advance one step per click, starting on the third dot
  // (matches the RCB default at activeIndex 1).
  const dotCount = 4;
  const activeDot = (activeTeamIndex + 1) % dotCount;

  const goTo = (index: number, dir: "forward" | "backward") => {
    if (index === activeTeamIndex) return;
    setTransition({ from: activeTeamIndex, dir });
    setActiveIndex(index);
  };

  const goPrev = () => goTo(prevIndex, "backward");
  const goNext = () => goTo(nextIndex, "forward");

  // CMS teams use one full-bleed background image; the built-in fallback keeps
  // the current split artwork so the default homepage looks unchanged.
  const renderBanner = (index: number, priority = false) => {
    const team = teams[index];
    if (team.backgroundImage) {
      return (
        <>
          <Image
            src={team.backgroundImage}
            alt=""
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
        </>
      );
    }

    const { left, right } = teamBanner(team);
    return (
      <>
        <div className="relative h-full w-1/2 overflow-hidden">
          <Image
            src={left}
            alt=""
            fill
            priority={priority}
            sizes="50vw"
            className="object-cover"
          />
        </div>
        <div className="relative h-full w-1/2 overflow-hidden">
          <Image
            src={right}
            alt=""
            fill
            priority={priority}
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>
      </>
    );
  };

  const renderTeamCard = (
    index: number,
    position: "left" | "center" | "right",
  ) => {
    const team = teams[index];
    const active = position === "center";
    return (
      <div
        key={team.name}
        onClick={() => {
          if (position === "left") goPrev();
          else if (position === "right") goNext();
        }}
        className={`flex shrink-0 items-center justify-center rounded-[10px] bg-white transition-all duration-200 ${
          active
            ? "h-[clamp(70px,8vw,100px)] w-[clamp(70px,8vw,100px)]"
            : "h-[clamp(52px,6vw,72px)] w-[clamp(52px,6vw,72px)] cursor-pointer opacity-90 hover:opacity-100"
        }`}
      >
        <Image
          src={team.logo}
          alt={team.name}
          width={team.logoWidth}
          height={team.logoHeight}
          className={`object-contain ${active ? "h-[70%] w-[70%]" : "h-[65%] w-[65%]"}`}
        />
      </div>
    );
  };

  return (
    <section className="relative h-[calc(100vh_-_72px)] min-h-[650px] w-full overflow-hidden">
      {/* BACKGROUND SLIDER */}
      <div className="absolute inset-0 z-0 bg-black">
        {transition ? (
          // Mid-slide: the outgoing and incoming banners tile together so a
          // visible seam sweeps across (the slide reads even when the artwork
          // is currently identical for every team).
          <>
            <div
              className="absolute inset-0 flex"
              style={{
                animation: `${SLIDE_ANIM[transition.dir].out} ${SLIDE_MS}ms cubic-bezier(0.22,1,0.36,1) both`,
              }}
            >
              {renderBanner(transition.from)}
            </div>
            <div
              className="absolute inset-0 flex"
              style={{
                animation: `${SLIDE_ANIM[transition.dir].in} ${SLIDE_MS}ms cubic-bezier(0.22,1,0.36,1) both`,
              }}
              onAnimationEnd={() => setTransition(null)}
            >
              {renderBanner(activeTeamIndex)}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex">
            {renderBanner(activeTeamIndex, true)}
          </div>
        )}
      </div>

      {/* CATEGORY + SEARCH */}
      <div className="absolute left-6 right-6 top-6 z-10 flex items-center gap-6">
        <div className="scrollbar-hide flex min-w-0 flex-1 gap-3 overflow-x-auto">
          <Link href="/category/all" className={PILL_CLASS}>
            View all
          </Link>
          {categoryList.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={PILL_CLASS}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Opens the shared SearchOverlay (live previews) rather than doing its
            own search, so the hero and the mobile dock behave identically. */}
        <button
          type="button"
          onClick={openSearch}
          aria-label="Search products"
          className="flex w-[260px] shrink-0 cursor-pointer items-center gap-3 border-b border-white/70 pb-2.5 text-left transition-colors hover:border-white"
        >
          <SearchIcon className="h-[22px] w-[22px] shrink-0 text-white" />
          <span className="text-[19px] text-white/90">Search</span>
        </button>
      </div>

      {/* TEE / HUB overlay text (fixed above the moving background). */}
      <div className="pointer-events-none absolute -left-7.5 top-1/2 z-[5] -translate-y-1/2 whitespace-nowrap font-display text-[clamp(60px,14vw,280px)] uppercase leading-[0.85] text-[#ff5820] min-[1440px]:text-[240px] max-[1024px]:text-[160px] max-[768px]:w-1/2 max-[360px]:hidden">
        TEE
      </div>
      <div className="pointer-events-none absolute -right-7.5 top-1/2 z-[5] -translate-y-1/2 whitespace-nowrap font-display text-[clamp(60px,14vw,280px)] uppercase leading-[0.85] text-[#ff5820] min-[1440px]:text-[240px] max-[1024px]:text-[160px] max-[768px]:w-1/2 max-[360px]:hidden">
        HUB
      </div>

      {/* CENTER BUTTON */}
      {hero.showCta && (
        <Link
          href={hero.ctaHref}
          className="absolute left-1/2 top-[55%] z-20 flex h-[clamp(60px,7vw,85px)] w-[clamp(180px,20vw,260px)] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#ff5b1f] text-[clamp(20px,2vw,30px)] font-normal text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] min-[1440px]:h-[60px] min-[1440px]:text-[30px] max-[1024px]:h-[50px]"
        >
          {hero.ctaLabel}
        </Link>
      )}

      {/* TEAM SLIDER */}
      <div className="absolute bottom-[30px] left-1/2 z-20 flex w-[clamp(280px,45vw,520px)] -translate-x-1/2 flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={goPrev}
            aria-label="Previous team"
            className="flex h-[clamp(24px,3vw,34px)] w-[clamp(24px,3vw,34px)] cursor-pointer items-center justify-center rounded-full bg-white/25 text-white transition-colors duration-200 hover:bg-white/40"
          >
            ‹
          </button>

          {renderTeamCard(prevIndex, "left")}
          {renderTeamCard(activeTeamIndex, "center")}
          {renderTeamCard(nextIndex, "right")}

          <button
            onClick={goNext}
            aria-label="Next team"
            className="flex h-[clamp(24px,3vw,34px)] w-[clamp(24px,3vw,34px)] cursor-pointer items-center justify-center rounded-full bg-white/25 text-white transition-colors duration-200 hover:bg-white/40"
          >
            ›
          </button>
        </div>

        <div aria-hidden="true" className="h-[22px]" />

        <Dots tone="light" count={dotCount} active={activeDot} />
      </div>
    </section>
  );
}
