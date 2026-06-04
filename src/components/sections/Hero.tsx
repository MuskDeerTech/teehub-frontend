"use client";

import Image from "next/image";
import { useState } from "react";
import Dots from "@/components/ui/Dots";
import { categories, teams } from "@/lib/products";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("IPL JERSEY 2026");
  // Default to RCB so the initial window shows MI · RCB · CSK.
  const [activeIndex, setActiveIndex] = useState(1);

  const teamCount = teams.length;
  const prevIndex = (activeIndex - 1 + teamCount) % teamCount;
  const nextIndex = (activeIndex + 1) % teamCount;

  // Fixed 4 dots that advance one step per click, starting on the third dot
  // (matches the RCB default at activeIndex 1).
  const dotCount = 4;
  const activeDot = (activeIndex + 1) % dotCount;

  const renderTeamCard = (index: number, position: "left" | "center" | "right") => {
    const team = teams[index];
    const active = position === "center";
    return (
      <div
        key={team.name}
        onClick={() => {
          if (position === "left") setActiveIndex(prevIndex);
          else if (position === "right") setActiveIndex(nextIndex);
        }}
        className={`flex shrink-0 items-center justify-center rounded-[10px] bg-white transition-all duration-200 ${
          active
            ? "h-[clamp(70px,8vw,100px)] w-[clamp(70px,8vw,100px)]"
            : "h-[clamp(52px,6vw,72px)] w-[clamp(52px,6vw,72px)] cursor-pointer opacity-90"
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
    <section className="relative grid h-[calc(100vh_-_72px)] min-h-[650px] w-full grid-cols-2 overflow-hidden">
      {/* CATEGORY */}
      <div className="scrollbar-hide absolute left-6 right-6 top-6 z-10 flex gap-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`cursor-pointer whitespace-nowrap rounded-full border border-white/40 px-5 py-2.5 text-[12px] font-bold tracking-[1px] backdrop-blur-[10px] ${
              activeTab === cat
                ? "bg-white text-black"
                : "bg-white/[0.08] text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LEFT */}
      <div className="relative h-full overflow-hidden">
        <Image
          src="/images/cat-bannerl.jpg"
          alt="Banner Left"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute left-[-10px] top-1/2 z-[5] -translate-y-1/2 whitespace-nowrap text-[clamp(40px,9vw,180px)] uppercase leading-[0.9] text-[#ff5820] min-[1440px]:h-[100px] min-[1440px]:text-[150px] max-[1024px]:h-[50px] max-[1024px]:text-[120px] max-[768px]:h-[5%] max-[768px]:w-1/2 max-[360px]:hidden">
          TEE
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative h-full overflow-hidden">
        <Image
          src="/images/cat-bannerr.jpg"
          alt="Banner Right"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="pointer-events-none absolute right-[-10px] top-1/2 z-[5] -translate-y-1/2 whitespace-nowrap text-[clamp(40px,9vw,180px)] uppercase leading-[0.9] text-[#ff5820] min-[1440px]:h-[100px] min-[1440px]:text-[150px] max-[1024px]:h-[50px] max-[1024px]:text-[120px] max-[768px]:h-[5%] max-[768px]:w-1/2 max-[360px]:hidden">
          HUB
        </div>
      </div>

      {/* CENTER BUTTON */}
      <button className="absolute left-1/2 top-[55%] z-20 h-[clamp(60px,7vw,85px)] w-[clamp(180px,20vw,260px)] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-[#ff5b1f] text-[clamp(20px,2vw,30px)] font-normal text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] min-[1440px]:h-[60px] min-[1440px]:text-[30px] max-[1024px]:h-[50px]">
        SHOP NOW
      </button>

      {/* TEAM SLIDER */}
      <div className="absolute bottom-[30px] left-1/2 z-20 flex w-[clamp(280px,45vw,520px)] -translate-x-1/2 flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveIndex(prevIndex)}
            aria-label="Previous team"
            className="h-[clamp(24px,3vw,34px)] w-[clamp(24px,3vw,34px)] cursor-pointer rounded-full bg-white/25 text-white"
          >
            ‹
          </button>

          {renderTeamCard(prevIndex, "left")}
          {renderTeamCard(activeIndex, "center")}
          {renderTeamCard(nextIndex, "right")}

          <button
            onClick={() => setActiveIndex(nextIndex)}
            aria-label="Next team"
            className="h-[clamp(24px,3vw,34px)] w-[clamp(24px,3vw,34px)] cursor-pointer rounded-full bg-white/25 text-white"
          >
            ›
          </button>
        </div>

        <div className="text-[15px] font-bold tracking-[1px] text-white">
          {teams[activeIndex].name}
        </div>

        <Dots tone="light" count={dotCount} active={activeDot} />
      </div>
    </section>
  );
}
