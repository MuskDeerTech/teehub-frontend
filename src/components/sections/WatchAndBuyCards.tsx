"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import QuickAddModal from "@/components/ui/QuickAddModal";
import type { HomepageWatchAndBuyItem } from "@/lib/homepage";
import { formatPriceRange, type Product } from "@/lib/products";

function ProductVideoCard({
  product,
  videoSrc,
}: {
  product: Product;
  videoSrc: string;
}) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const hasSalePrice = product.price != null;
  const unitPrice = product.price ?? product.priceMin;
  const unitMrp = product.originalPrice ?? unitPrice;

  return (
    <article className="flex w-full flex-col">
      <Link
        href={`/product/${product.slug}`}
        aria-label={`View ${product.title}`}
        className="group relative block aspect-[9/14] w-full overflow-hidden rounded-[10px] bg-[#ededed]"
      >
        <video
          src={videoSrc}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-2.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[calc(1.3em*2)] text-[13px] font-bold uppercase leading-[1.3] text-[#111] transition-colors hover:text-[#f36d43] sm:text-[15px] min-[1440px]:text-[17px]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-2.5">
          {hasSalePrice && product.originalPrice != null && (
            <span className="text-[13px] text-[#999] line-through sm:text-[15px] min-[1440px]:text-[16px]">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          <span className="text-[13px] font-bold text-[#111] sm:text-[15px] min-[1440px]:text-[16px]">
            {hasSalePrice
              ? `₹${unitPrice.toLocaleString("en-IN")}`
              : formatPriceRange(product)}
          </span>
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            aria-label={`Add ${product.title} to cart`}
            className="ml-auto cursor-pointer text-[20px] text-black"
          >
            +
          </button>
        </div>
      </div>

      {quickAddOpen && (
        <QuickAddModal
          product={product}
          unitPrice={unitPrice}
          unitMrp={unitMrp}
          onClose={() => setQuickAddOpen(false)}
        />
      )}
    </article>
  );
}

export default function WatchAndBuyCards({
  items,
}: {
  items: HomepageWatchAndBuyItem[];
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const showArrows = items.length > 4;

  function scrollCards(direction: "left" | "right") {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const card = carousel.querySelector<HTMLElement>("[data-video-card]");
    const cardWidth = card?.offsetWidth ?? carousel.clientWidth / 4;
    carousel.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full bg-white px-[30px] py-[40px] min-[1440px]:px-20 min-[1440px]:py-[60px] max-[480px]:px-4 max-[480px]:py-6 max-[360px]:px-3 max-[360px]:py-5">
      <div className="mb-8 flex items-center justify-between gap-5">
        <h2 className="text-[clamp(22px,3vw,40px)] font-extrabold text-[#111]">
          Watch and Buy
        </h2>

        {showArrows && (
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              aria-label="Previous Watch and Buy videos"
              onClick={() => scrollCards("left")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#111] text-white transition-colors hover:bg-[#333]"
            >
              <IconChevronLeft size={22} stroke={2} />
            </button>
            <button
              type="button"
              aria-label="Next Watch and Buy videos"
              onClick={() => scrollCards("right")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#111] text-white transition-colors hover:bg-[#333]"
            >
              <IconChevronRight size={22} stroke={2} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={carouselRef}
        className="
          scrollbar-hide
          flex gap-4
          snap-x snap-mandatory overflow-x-auto pb-2.5
          [&>*]:w-[42%] [&>*]:shrink-0 [&>*]:snap-start

          sm:gap-6 sm:[&>*]:w-[42%]

          lg:gap-6 lg:pb-0
          lg:[&>*]:w-[calc((100%_-_72px)/4)] lg:[&>*]:shrink-0
        "
      >
        {items.map(({ product, video }) => (
          <div key={product.slug} data-video-card>
            <ProductVideoCard product={product} videoSrc={video} />
          </div>
        ))}
      </div>
    </section>
  );
}
