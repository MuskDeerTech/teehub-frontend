import Image from "next/image";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/homepage";

export default function JacketSection({ banner }: { banner: HomepageBanner }) {
  if (!banner.image) return null;

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden max-[640px]:min-h-[620px]">
      <Image
        src={banner.image}
        alt={banner.heading || "Banner 2"}
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* OVERLAY CONTENT */}
      <div className="absolute inset-0 z-10 flex items-end justify-center bg-black/20 px-4 pb-8 sm:pb-12 lg:pb-[60px]">
        <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
          {banner.heading && (
            <h2 className="max-w-[280px] text-[22px] font-normal uppercase leading-[1.1] tracking-[0.01em] text-white sm:max-w-[400px] sm:text-[34px] lg:max-w-[500px] lg:text-[48px]">
              {banner.heading}
            </h2>
          )}
          {banner.subtext && (
            <p className="text-[13px] text-white sm:text-[15px]">
              {banner.subtext}
            </p>
          )}
          {banner.showCta && (
            <Link
              href={banner.ctaHref}
              className="flex h-10 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap rounded-[143.25px] border border-white bg-transparent px-5 text-[13px] font-bold tracking-[1.5px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:h-11 sm:px-6 sm:text-[14px] lg:h-12 lg:px-[30px] lg:py-2.5 lg:text-[16px] lg:tracking-[2px]"
            >
              {banner.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
