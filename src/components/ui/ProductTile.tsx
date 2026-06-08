import Image from "next/image";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { productBookmarkId } from "@/lib/bookmarks";
import type { Product } from "@/lib/products";
import { formatPriceRange } from "@/lib/products";

/**
 * Catalog card used on the category listing pages.
 *
 * The image area is a FIXED `aspect-[3/4]` box with the product's background
 * colour. The jersey sits inside it with `object-contain object-bottom`, so:
 *  - every card is the exact same size no matter how big/small the source
 *    image file is, and
 *  - the whole jersey is always visible (never cropped) and anchored to the
 *    bottom, which keeps the grid looking consistent.
 *
 * `product.image` is optional — until the Figma exports are added, the card
 * just renders the coloured box (matching the build-now / drop-images-later
 * plan). A CMS focal-point crop later feeds this same box with zero changes.
 */
export default function ProductTile({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col">
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-[10px]"
        style={{ backgroundColor: product.bg }}
      >
        <BookmarkButton
          id={productBookmarkId(product.slug)}
          className="absolute right-3 top-3 z-10 text-white/95 drop-shadow transition-transform duration-200 hover:scale-110"
        />

        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-contain object-bottom pt-3 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>

      <div className="flex items-start justify-between gap-3 pt-3">
        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.5px] text-[#111]">
            {product.title}
          </h3>
          <p className="mt-1 text-[14px] text-[#444]">
            {formatPriceRange(product)}
          </p>
        </div>
        <button
          type="button"
          aria-label={`Add ${product.title} to cart`}
          className="shrink-0 text-[26px] leading-none text-[#111] transition-colors duration-200 hover:text-[#ff5b1f]"
        >
          +
        </button>
      </div>
    </article>
  );
}
