import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { getLatestProductsByCategory } from "@/lib/catalog";
import type { HomepageCategorySection } from "@/lib/homepage";

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
    gapHeadingToButton: "gap-4",
    gapHeaderToSlider: "mb-8",
  },
  heading: {
    size: "text-[clamp(18px,2.2vw,32px)]",
  },
  button: {
    paddingX: "px-[18px]",
    paddingY: "py-2.5",
  },
  slider: {
    gap: "gap-6",
    gapLg: "lg:gap-6",
  },
} as const;

export default async function PoloShirts({
  category,
}: {
  category: HomepageCategorySection;
}) {
  const products = await getLatestProductsByCategory(category.slug, 4);

  if (products.length === 0) return null;

  return (
    <section
      className={`w-full bg-white ${config.section.paddingX} ${config.section.paddingY} ${config.section.paddingXLg} ${config.section.paddingYLg} max-[480px]:px-4 max-[480px]:py-6 max-[360px]:px-3 max-[360px]:py-5`}
    >
      <div
        className={`flex w-full items-center justify-between ${config.header.gapHeadingToButton} ${config.header.gapHeaderToSlider} max-[360px]:gap-1.5`}
      >
        <h2
          className={`m-0 font-normal leading-[27.65px] tracking-[1px] text-[#111] ${config.heading.size} max-[768px]:text-[clamp(22px,3vw,45px)] max-[480px]:text-[16px] max-[480px]:leading-[1.3] max-[360px]:flex-1 max-[360px]:text-left max-[360px]:text-[16px]`}
        >
          {category.label}
        </h2>
        <Link
          href={`/category/${category.slug}`}
          className={`whitespace-nowrap rounded-[30px] bg-[#ff5b1f] font-semibold text-white ${config.button.paddingX} ${config.button.paddingY} max-[480px]:h-auto max-[480px]:px-3.5 max-[480px]:py-2 max-[480px]:text-[11px] max-[360px]:ml-auto max-[360px]:px-3 max-[360px]:py-[7px] max-[360px]:text-[10px]`}
        >
          DISCOVER MORE
        </Link>
      </div>

      <div
        className={`
          scrollbar-hide
          flex gap-4
          snap-x snap-mandatory overflow-x-auto pb-2.5
          [&>*]:w-[42%] [&>*]:shrink-0 [&>*]:snap-start

          sm:${config.slider.gap} sm:[&>*]:w-[42%]

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
