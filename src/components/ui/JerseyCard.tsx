"use client";

import Image from "next/image";
import Link from "next/link";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { jerseyBookmarkId } from "@/lib/bookmarks";
import { useCart } from "@/components/cart/CartContext";
import { formatPriceRange } from "@/lib/products";
import type { Product } from "@/lib/products";

// Quick-add starts at L; customers can adjust it with the cart size controls.
const DEFAULT_SIZE = "L";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * EDIT THIS CONFIG to change layout. "normal" = full jersey card,
 * "compact" = smaller card used on product pages ("You May Also Like").
 * ─────────────────────────────────────────────────────────────────────────
 */
const config = {
  normal: {
    image: {
      aspect: "aspect-[330/430]",
      aspectSm: "sm:aspect-[330/470]",
      aspectLg: "lg:aspect-[330/480]",
      position: "object-bottom",
      zoom: "scale-100",
      rounded: "rounded-[10px]",
    },
    bookmark: { position: "right-3 top-3" },
    gapImageToText: "pt-2.5",
    gapTitleToPrice: "mt-1.5",
    title: {
      size: "text-[16px]",
      sizeSm: "sm:text-[18px]",
      size1440: "min-[1440px]:text-[18px]",
      weight: "font-normal",
      weight1440: "min-[1440px]:font-bold",
      lines: "line-clamp-2",
    },
    price: {
      size: "text-[15px]",
      sizeSm: "sm:text-[18px]",
      size1440: "min-[1440px]:text-[15px]",
      gapToButton: "ml-2.5",
    },
    button: { size: "text-[20px]", position: "ml-auto" },
  },
  compact: {
    image: {
      aspect: "aspect-[330/350]",
      aspectSm: "sm:aspect-[330/350]",
      aspectLg: "lg:aspect-[330/350]",
      position: "object-top",
      zoom: "scale-100",
      rounded: "rounded-[10px]",
    },
    bookmark: { position: "right-3 top-3" },
    gapImageToText: "pt-2.5",
    gapTitleToPrice: "mt-1",
    title: {
      size: "text-[15px]",
      sizeSm: "sm:text-[15px]",
      size1440: "min-[1440px]:text-[15px]",
      weight: "font-semibold",
      weight1440: "",
      lines: "line-clamp-2",
    },
    price: {
      size: "text-[14px]",
      sizeSm: "sm:text-[14px]",
      size1440: "min-[1440px]:text-[14px]",
      gapToButton: "ml-2",
    },
    button: { size: "text-[18px]", position: "ml-auto" },
  },
} as const;

export default function JerseyCard({
  product,
  compact = false,
  href,
}: {
  product: Product;
  compact?: boolean;
  href?: string;
}) {
  const c = compact ? config.compact : config.normal;
  const { addItem } = useCart();

  const hasSalePrice = product.price != null;
  const unitPrice = product.price ?? product.priceMin;
  const unitMrp = product.originalPrice ?? unitPrice;

  function handleAddToCart() {
    addItem({
      id: product.slug,
      name: product.title,
      image: product.image ?? "",
      size: DEFAULT_SIZE,
      quantity: 1,
      price: unitPrice,
      mrp: unitMrp,
    });
  }

  return (
    <div className="group flex w-full flex-col">
      {/* IMAGE */}
      <div
        className={[
          "relative w-full overflow-hidden",
          c.image.rounded,
          c.image.aspect,
          c.image.aspectSm,
          c.image.aspectLg,
        ].join(" ")}
        style={{ backgroundColor: product.bg }}
      >
        <BookmarkButton
          id={jerseyBookmarkId(product.title)}
          className={`absolute z-10 text-white/95 drop-shadow transition-transform duration-200 hover:scale-110 ${c.bookmark.position}`}
        />

        {product.image && (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
            className={[
              "object-cover transition-transform duration-300",
              c.image.position,
              c.image.zoom,
              "group-hover:scale-105",
            ].join(" ")}
          />
        )}
      </div>

      {/* TEXT BLOCK */}
      <div className={`flex flex-1 flex-col ${c.gapImageToText}`}>
        <h3
          className={[
            "min-h-[calc(1.3em*2)] leading-[1.3] text-black",
            c.title.lines,
            c.title.size,
            c.title.sizeSm,
            c.title.size1440,
            c.title.weight,
            c.title.weight1440,
          ].join(" ")}
        >
          {href ? (
            <Link href={href} className="transition-colors hover:text-[#f36d43]">
              {product.title}
            </Link>
          ) : (
            product.title
          )}
        </h3>

        <div className={`flex items-center justify-between ${c.gapTitleToPrice}`}>
          <span className={`text-[#444] ${c.price.size} ${c.price.sizeSm} ${c.price.size1440}`}>
            {hasSalePrice ? `₹${unitPrice.toLocaleString("en-IN")}` : formatPriceRange(product)}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
            className={`cursor-pointer text-black ${c.button.size} ${c.button.position} ${c.price.gapToButton}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
