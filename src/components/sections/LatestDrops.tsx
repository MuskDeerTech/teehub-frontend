import Link from "next/link";
import JerseyCard from "@/components/ui/JerseyCard";
import { formatPriceRange, latestDrops, iplJerseys } from "@/lib/products";
import type { JerseyDrop } from "@/lib/products";

type DropWithMeta = JerseyDrop & { slug?: string; bgColor?: string };

function findSlug(title: string): string | undefined {
  return iplJerseys.find(
    (product) => product.title.toLowerCase() === title.toLowerCase(),
  )?.slug;
}

export default function LatestDrops({
  productPage = false,
  excludeSlug,
}: {
  productPage?: boolean;
  excludeSlug?: string;
}) {
  const drops: DropWithMeta[] = productPage
    ? iplJerseys
        .filter((product) => product.slug !== excludeSlug)
        .filter(
          (product, index, products) =>
            products.findIndex((item) => item.title === product.title) === index,
        )
        .slice(0, 4)
        .map((product) => ({
          slug: product.slug,
          title: product.title,
          image: product.image ?? "",
          alt: product.title,
          bg: "",
          bgColor: product.bg,
          price: formatPriceRange(product),
        }))
    : latestDrops.map((drop) => ({
        ...drop,
        slug: findSlug(drop.title),
      }));

  return (
    <section className="w-full bg-[#f5f5f5] px-[clamp(16px,4vw,80px)] py-[60px]">
      <div className="mb-8 flex items-center justify-between gap-5">
        <h2
          className={`font-extrabold text-[#111] ${
            productPage ? "text-[22px] sm:text-[30px]" : "text-[clamp(22px,3vw,40px)]"
          }`}
        >
          {productPage ? "You May Also Like" : "Latest Drops"}
        </h2>

        {!productPage && (
          <Link
            href="/category/ipl-jersey"
            className="flex h-10 items-center whitespace-nowrap rounded-full bg-[#ff5b1f] px-5 text-[12px] font-bold text-white sm:h-11 sm:px-7 sm:text-[13px]"
          >
            DISCOVER MORE
          </Link>
        )}
      </div>

     <div
  className="
    scrollbar-hide
    flex gap-4
    snap-x snap-mandatory overflow-x-auto pb-2.5
    [&>*]:shrink-0 [&>*]:snap-center
    [&>*]:w-[85%]

    sm:[&>*]:w-[calc(50%-10px)]

    lg:grid lg:grid-cols-4 lg:gap-[18px] lg:overflow-visible lg:snap-none lg:pb-0
    lg:[&>*]:w-auto lg:[&>*]:shrink
  "
>
        {drops.map((drop) => (
          <JerseyCard
            key={drop.slug ?? drop.title}
            drop={drop}
            compact={productPage}
            bgColor={drop.bgColor}
            href={drop.slug ? `/product/${drop.slug}` : undefined}
          />
        ))}
      </div>
    </section>
  );
}