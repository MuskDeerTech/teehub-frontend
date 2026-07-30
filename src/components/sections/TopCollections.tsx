import Image from "next/image";
import Link from "next/link";
import { getHomepageTopCollections } from "@/lib/homepage";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * EDIT THIS CONFIG to control section-level spacing and card shape.
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
    gapHeaderToCards: "mb-[30px]",
  },
  card: {
    aspect: "aspect-[5/8]",
    rounded: "rounded-[10px]",
    gapImageToLabel: "mt-3",
  },
} as const;

export default async function TopCollections() {
  const data = await getHomepageTopCollections();

  if (data.items.length === 0) return null;

  return (
    <section
      className={`w-full bg-white ${config.section.paddingX} ${config.section.paddingY} ${config.section.paddingXLg} ${config.section.paddingYLg} max-[480px]:px-4 max-[480px]:py-6 max-[360px]:px-3 max-[360px]:py-5`}
    >
      <div
        className={`flex items-center justify-between ${config.header.gapHeaderToCards}`}
      >
        <h2 className="m-0 text-[clamp(18px,2.2vw,32px)] font-normal tracking-[1px] text-[#111] max-[480px]:flex-1 max-[480px]:text-left max-[480px]:text-[16px] max-[480px]:leading-[1.3]">
          {data.title}
        </h2>
        <Link
          href={data.discoverHref}
          className="flex h-11 items-center rounded-full bg-[#ff5b1f] px-6 text-[14px] font-medium text-white max-[480px]:ml-auto max-[480px]:whitespace-nowrap max-[480px]:px-3.5 max-[480px]:py-2 max-[480px]:text-[11px] max-[360px]:px-3 max-[360px]:py-[7px] max-[360px]:text-[10px]"
        >
          DISCOVER MORE
        </Link>
      </div>

      <div
        className="
          scrollbar-hide
          flex gap-4
          snap-x snap-mandatory overflow-x-auto pb-2.5
          [&>*]:w-[38%] [&>*]:shrink-0 [&>*]:snap-start
          sm:[&>*]:w-[28%]

          lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:snap-none lg:pb-0
          lg:[&>*]:w-auto lg:[&>*]:shrink
        "
      >
        {data.items.map((item) => (
          <Link key={item.href + item.label} href={item.href} className="group block">
            <div
              className={`relative w-full overflow-hidden bg-[#ededed] ${config.card.aspect} ${config.card.rounded}`}
            >
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="(min-width: 1024px) 15vw, (min-width: 640px) 28vw, 38vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </div>

            <p
              className={`text-center text-[11px] font-semibold uppercase leading-[1.3] tracking-[0.5px] text-[#111] transition-colors group-hover:text-[#f36d43] sm:text-[13px] min-[1440px]:text-[14px] ${config.card.gapImageToLabel}`}
            >
              {item.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
