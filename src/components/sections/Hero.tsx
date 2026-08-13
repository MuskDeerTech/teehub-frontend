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

/**
 * Shared style for the hero's "View all" + category pills. The colours are
 * split out of the base so they can follow the active slide's theme — white
 * pills vanish against bright artwork now that it isn't dimmed by a scrim.
 */
const PILL_BASE =
  "cursor-pointer whitespace-nowrap rounded-full border bg-transparent px-5 py-2.5 text-[12px] font-bold tracking-[1px] backdrop-blur-[10px] transition-colors duration-200";
const PILL_THEME = {
  dark: "border-white/40 text-white hover:bg-white hover:text-black",
  light: "border-black/30 text-[#111111] hover:bg-[#111111] hover:text-white",
} as const;

/**
 * The trust strip under the headline. Identical on every slide, so it lives here
 * rather than as CMS rows repeated per team — only the headline and its colour
 * differ between slides. The SVGs carry their own orange (#FF5820) and never
 * recolour; it's the labels that flip with the theme.
 */
const HERO_BADGES = [
  { src: "/svg/hero/heart.svg", width: 44, height: 40, label: "Trusted\nby Fans" },
  { src: "/svg/hero/premium.svg", width: 48, height: 46, label: "Premium\nQuality" },
  { src: "/svg/hero/delivery.svg", width: 52, height: 52, label: "Fast\nDelivery" },
  { src: "/svg/hero/custom.svg", width: 37, height: 37, label: "Custom\nMade" },
] as const;

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

  const activeTeam = teams[activeTeamIndex];
  // Bright artwork (a sky background, say) needs black copy over it. One flag
  // rather than a colour field, because it drives both the headline and the
  // badge labels — and a free-form colour could be made unreadable.
  const light = activeTeam.theme === "light";
  const pillClass = `${PILL_BASE} ${PILL_THEME[light ? "light" : "dark"]}`;

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
          {/* Darkens the artwork so white copy stays readable. A light slide's
              copy is already black, so the scrim would only mute the artwork —
              read off this banner's own team, not the active one, so both
              layers of a transition are treated correctly. */}
          {team.theme !== "light" && (
            <div className="absolute inset-0 bg-black/25" />
          )}
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
            ? "h-[clamp(56px,8vw,100px)] w-[clamp(56px,8vw,100px)] max-[1024px]:h-[clamp(56px,5vw,64px)] max-[1024px]:w-[clamp(56px,5vw,64px)]"
            : "h-[clamp(44px,6vw,72px)] w-[clamp(44px,6vw,72px)] cursor-pointer opacity-90 hover:opacity-100 max-[1024px]:h-[clamp(44px,4vw,50px)] max-[1024px]:w-[clamp(44px,4vw,50px)]"
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
    // Full viewport height on desktop. Phones and tablets get ~56svh: a
    // full-height hero is a portrait slab on a 9:19.5 screen, which both dwarfed
    // the product rows below and forced `object-cover` to crop the artwork to a
    // narrow vertical strip. `svh` (not `vh`) so browser chrome is excluded.
    <section className="relative h-[calc(100vh_-_72px)] min-h-[650px] w-full overflow-hidden max-[1024px]:h-[56svh] max-[1024px]:min-h-[450px]">
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
        {/* Phones only (<=640px) drop the pills: at that width they had no room
            beside the search field and clipped mid-word. Categories stay
            reachable there via the marquee above the hero and the hamburger
            menu. Tablets are wide enough to keep pills and search together. */}
        <div className="scrollbar-hide flex min-w-0 flex-1 gap-3 overflow-x-auto max-[640px]:hidden">
          <Link href="/category/all" className={pillClass}>
            View all
          </Link>
          {categoryList.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={pillClass}
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
          className={`flex w-[260px] shrink-0 cursor-pointer items-center gap-3 border-b pb-2.5 text-left transition-colors max-[640px]:w-full ${
            light
              ? "border-black/40 hover:border-black"
              : "border-white/70 hover:border-white"
          }`}
        >
          <SearchIcon
            className={`h-[22px] w-[22px] shrink-0 max-[640px]:h-[20px] max-[640px]:w-[20px] ${
              light ? "text-[#111111]" : "text-white"
            }`}
          />
          <span
            className={`text-[19px] max-[640px]:text-[16px] ${light ? "text-[#111111]" : "text-white/90"}`}
          >
            Search
          </span>
        </button>
      </div>

      {/* LEFT COPY BLOCK
          Only the two headline lines and the light/dark flag come from the CMS
          (per team). The GEAR UP label, the four badges and the button are the
          same on every slide, so they're fixed here. Bebas Neue for the display
          copy, Inter (the body face) for the badges and button — matching the
          design, and both fonts are already loaded by the storefront layout.

          Sizes are `clamp(min, vw, design)` so the design values land at ~1440px
          and scale down smoothly rather than snapping at breakpoints. */}
      {/* Vertically centred at every width — same composition as desktop, just
          smaller. Below 1024px the section is ~40% shorter but the copy is
          still sized off viewport *width*, so each item below also caps its
          `vw` term on that breakpoint; without those caps the stack is taller
          than the space between the pill row and the team slider. */}
      <div className="absolute left-[clamp(20px,5.5vw,78px)] top-1/2 z-10 w-[min(88vw,470px)] -translate-y-1/2">
        <p className="font-bebas text-[clamp(14px,1.95vw,28px)] uppercase leading-none tracking-[1.5px] text-[#ff5820] max-[1024px]:text-[clamp(14px,1.4vw,18px)]">
          GEAR UP
        </p>

        {/* The homepage has no other h1, so the hero headline is the page's. */}
        {(activeTeam.headlineTop || activeTeam.headlineBottom) && (
          <h1 className="mt-[clamp(4px,1vw,14px)] font-bebas text-[clamp(38px,7.4vw,106px)] uppercase leading-[0.87] max-[1024px]:mt-[clamp(4px,0.6vw,8px)] max-[1024px]:text-[clamp(38px,5vw,52px)]">
            {activeTeam.headlineTop && (
              <span className={`block ${light ? "text-[#111111]" : "text-white"}`}>
                {activeTeam.headlineTop}
              </span>
            )}
            {activeTeam.headlineBottom && (
              <span className="block text-[#ff5820]">
                {activeTeam.headlineBottom}
              </span>
            )}
          </h1>
        )}

        <div className="mt-[clamp(8px,1.6vw,22px)] h-[4px] w-[clamp(110px,13.4vw,193px)] bg-[#ff5820] max-[1024px]:mt-[clamp(8px,1vw,14px)]" />

        {/* Cells size to their content (the design uses Hug widths), so the
            dividers sit tight to the labels instead of spreading. */}
        <div className="mt-[clamp(10px,2.2vw,30px)] flex items-stretch max-[1024px]:mt-[clamp(10px,1.2vw,18px)]">
          {HERO_BADGES.map((badge, index) => (
            <div
              key={badge.src}
              className={`flex flex-col items-center gap-[clamp(4px,0.8vw,10px)] px-[clamp(8px,1.3vw,18px)] ${
                index === 0
                  ? "pl-0"
                  : light
                    ? "border-l border-black/15"
                    : "border-l border-white/25"
              }`}
            >
              <Image
                src={badge.src}
                alt=""
                width={badge.width}
                height={badge.height}
                className="h-[clamp(20px,2.3vw,32px)] w-auto max-[1024px]:h-[clamp(20px,1.8vw,24px)]"
              />
              <span
                className={`whitespace-pre-line text-center text-[clamp(10px,0.95vw,13.72px)] font-semibold leading-[1.3] ${
                  light ? "text-[#111111]" : "text-white"
                }`}
              >
                {badge.label}
              </span>
            </div>
          ))}
        </div>

        {hero.showCta && (
          <Link
            href={hero.ctaHref}
            className="mt-[clamp(14px,2.6vw,36px)] inline-flex cursor-pointer items-center justify-center rounded-full bg-[#ff5b1f] px-[clamp(20px,2.6vw,34px)] py-[clamp(8px,1.1vw,14px)] text-[clamp(14px,1.4vw,20px)] font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-colors duration-200 hover:bg-[#e64d15] max-[1024px]:mt-[clamp(14px,1.6vw,22px)] max-[1024px]:py-[clamp(8px,0.9vw,11px)] max-[1024px]:text-[clamp(14px,1.1vw,16px)]"
          >
            {hero.ctaLabel}
          </Link>
        )}
      </div>

      {/* TEAM SLIDER */}
      {/* Sits at the bottom at every width. The floating nav dock (Navbar,
          `bottom-5`) is pinned to the viewport rather than to this section, and
          now the hero is ~56svh its bottom edge lands well clear of the dock at
          the top of the page — so this row no longer needs to lift out of the
          way the way it did when the hero filled the whole viewport. */}
      <div className="absolute bottom-[30px] left-1/2 z-20 flex w-[clamp(280px,45vw,520px)] -translate-x-1/2 flex-col items-center gap-2 max-[1024px]:bottom-[12px]">
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

        <div aria-hidden="true" className="h-[22px] max-[1024px]:h-[8px]" />

        <Dots tone="light" count={dotCount} active={activeDot} />
      </div>
    </section>
  );
}
