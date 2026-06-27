import Image from "next/image";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/homepage";

const config = {
  section: {
    className: "h-[100svh] min-h-[560px] max-[640px]:min-h-[620px]",
  },
} as const;
 
export default function PlayBoldBanner({ banner }: { banner: HomepageBanner }) {
  if (!banner.image) return null;

  const hasContent = Boolean(
    banner.heading || banner.subtext || banner.showCta,
  );

  return (
    <section className={`relative w-full overflow-hidden ${config.section.className}`}>
      <Image
        src={banner.image}
        alt={banner.heading || "Banner 3"}
        fill
        priority
        sizes="100vw"
        className="z-[1] object-cover object-center"
      />

      {hasContent && (
        <div className="absolute inset-0 z-[4] flex items-center justify-center px-4 text-center">
          <div className="flex max-w-[520px] flex-col items-center gap-3">
            {banner.heading && (
              <h2 className="text-[clamp(26px,4vw,52px)] font-bold uppercase leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                {banner.heading}
              </h2>
            )}
            {banner.subtext && (
              <p className="text-[13px] font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-[15px]">
                {banner.subtext}
              </p>
            )}
            {banner.showCta && (
              <Link
                href={banner.ctaHref}
                className="flex h-10 items-center justify-center rounded-full border border-white bg-transparent px-6 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-white hover:text-black sm:h-11 sm:px-7 sm:text-[14px]"
              >
                {banner.ctaLabel}
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
