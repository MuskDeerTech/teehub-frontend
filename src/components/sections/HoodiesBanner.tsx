import Image from "next/image";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/homepage";

export default function HoodiesBanner({ banner }: { banner: HomepageBanner }) {
  if (!banner.image) return null;

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden max-[640px]:min-h-[620px]">
      <Image
        src={banner.image}
        alt={banner.heading || "Banner 1"}
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 flex items-end justify-center bg-black/15 px-4 pb-10 sm:pb-12 lg:pb-[60px]">
        <div className="flex flex-col items-center gap-2.5 text-center sm:gap-3 lg:gap-4">
          {banner.heading && (
            <h2 className="text-[clamp(28px,5vw,52px)] uppercase leading-none text-white">
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
              className="flex h-9 cursor-pointer items-center rounded-full border border-white bg-transparent px-5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black sm:h-11 sm:px-7 sm:text-[15px] lg:h-12 lg:px-[30px] lg:text-[16px]"
            >
              {banner.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
