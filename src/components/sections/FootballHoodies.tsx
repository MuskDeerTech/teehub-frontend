import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { getProductsByCategory } from "@/lib/catalog";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * EDIT THIS CONFIG to control section-level spacing.
 * ─────────────────────────────────────────────────────────────────────────
 */
const config = {
  section: {
    paddingX: "px-[30px]",
    paddingXLg: "min-[1440px]:px-20",
    paddingY: "py-[40px]",
    paddingYLg: "min-[1440px]:py-[60px]",
  },
  header: {
    gapHeaderToSlider: "mb-[30px]",
  },
  slider: {
    gap: "gap-6",
    gapLg: "lg:gap-6",
  },
} as const;

export default async function FootballHoodies() {
  const products = (await getProductsByCategory("hoodies")).slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section
      className={`w-full ${config.section.paddingX} ${config.section.paddingY} ${config.section.paddingXLg} ${config.section.paddingYLg} max-[480px]:px-4 max-[480px]:py-6 max-[360px]:px-3 max-[360px]:py-5`}
    >
      <div
        className={`flex items-center justify-between ${config.header.gapHeaderToSlider}`}
      >
        <h2 className="m-0 text-[clamp(18px,2.2vw,32px)] font-normal tracking-[1px] text-[#111] max-[480px]:flex-1 max-[480px]:text-left max-[480px]:text-[16px] max-[480px]:leading-[1.3]">
          Football Hoodies
        </h2>
        <Link
          href="/category/hoodies"
          className="flex h-11 items-center rounded-full bg-[#ff5b1f] px-6 text-[14px] font-medium text-white max-[480px]:ml-auto max-[480px]:whitespace-nowrap max-[480px]:px-3.5 max-[480px]:py-2 max-[480px]:text-[11px] max-[360px]:px-3 max-[360px]:py-[7px] max-[360px]:text-[10px]"
        >
          DISCOVER MORE
        </Link>
      </div>

      <div
        className={`
          scrollbar-hide
          flex ${config.slider.gap}
          snap-x snap-mandatory overflow-x-auto pb-2.5
          [&>*]:shrink-0 [&>*]:snap-center
          [&>*]:w-[85%]

          sm:[&>*]:w-[calc(50%-10px)]

          lg:grid lg:grid-cols-4 ${config.slider.gapLg} lg:overflow-visible lg:snap-none lg:pb-0
          lg:[&>*]:w-auto lg:[&>*]:shrink
        `}
      >
        {products.map((product) => (
          <ProductCard key={product.slug} variant="polo" product={product} />
        ))}
      </div>
    </section>
  );
}
