import Image from "next/image";
import Link from "next/link";
import type { HomepageBanner } from "@/lib/homepage";

export default function JacketSection({ banner }: { banner: HomepageBanner }) {
  if (!banner.image) return null;

  return (
    // On phones the height comes from the artwork's own aspect ratio (this
    // banner's source is 1440x857) rather than the viewport, so `object-cover`
    // has nothing to crop and the whole image is visible.
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden max-[1024px]:h-[52svh] max-[1024px]:min-h-[360px] max-[640px]:aspect-[1440/857] max-[640px]:h-auto max-[640px]:min-h-0">
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
            // Figma: Bold 40 / 46.2 line-height / +1% tracking, on one line.
            // The clamp scales that 40px down on narrow viewports so
            // `whitespace-nowrap` can't overflow the section.
            <h2 className="whitespace-nowrap text-[clamp(18px,4.6vw,40px)] font-bold uppercase leading-[1.155] tracking-[0.01em] text-white">
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
