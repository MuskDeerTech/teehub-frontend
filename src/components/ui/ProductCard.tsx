"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { formatPriceRange } from "@/lib/products";
import type { Product } from "@/lib/products";
import QuickAddModal from "@/components/ui/QuickAddModal";

type Variant = "hoodie" | "polo";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * EDIT THIS CONFIG to change layout per variant. See bottom of file for the
 * image-position / scale / spacing cheat sheet.
 * ─────────────────────────────────────────────────────────────────────────
 */
const config = {
  hoodie: {
    image: {
      aspect: "aspect-[330/430]",
      aspectSm: "sm:aspect-[330/470]",
      aspectLg: "lg:aspect-[330/480]",
      position: "object-bottom",
      objectPositionCustom: "",
      zoom: "scale-100",
      rounded: "rounded-[10px]",
    },
    gapImageToText: "pt-2.5",
    gapTitleToPrice: "mt-1.5",
    title: {
      size: "text-[13px]",
      sizeSm: "sm:text-[15px]",
      size1440: "min-[1440px]:text-[17px]",
      weight: "font-bold",
      weight1440: "min-[1440px]:font-normal",
      case: "uppercase",
      lines: "line-clamp-2",
    },
    price: {
      size: "text-[13px]",
      sizeSm: "sm:text-[15px]",
      size1440: "min-[1440px]:text-[16px]",
      gapBetweenOldAndNew: "gap-2.5",
      gapToButton: "ml-2.5",
    },
    button: {
      size: "text-[20px]",
      position: "ml-auto",
    },
  },
  polo: {
    image: {
      aspect: "aspect-[330/430]",
      aspectSm: "sm:aspect-[330/470]",
      aspectLg: "lg:aspect-[330/480]",
      position: "object-bottom",
      objectPositionCustom: "",
      zoom: "scale-100",
      rounded: "rounded-[10px]",
    },
    gapImageToText: "pt-2.5",
    gapTitleToPrice: "mt-1.5",
    title: {
      size: "text-[13px]",
      sizeSm: "sm:text-[15px]",
      size1440: "min-[1440px]:text-[20px]",
      weight: "font-normal",
      weight1440: "",
      case: "uppercase",
      lines: "line-clamp-3",
    },
    price: {
      size: "text-[13px]",
      sizeSm: "sm:text-[15px]",
      size1440: "min-[1440px]:text-[16px]",
      gapBetweenOldAndNew: "gap-2.5",
      gapToButton: "ml-2.5",
    },
    button: {
      size: "text-[20px]",
      position: "ml-auto",
    },
  },
} as const satisfies Record<Variant, unknown>;

export default function ProductCard({
  variant,
  product,
}: {
  variant: Variant;
  product: Product;
}) {
  const c = config[variant];
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const cardImages = useMemo(
    () =>
      [
        ...(product.image
          ? [{ src: product.image, alt: product.title }]
          : []),
        ...(product.images ?? []).map((image) => ({
          src: image.src,
          alt: image.alt || product.title,
        })),
      ].filter(
        (image, index, images) =>
          images.findIndex((candidate) => candidate.src === image.src) ===
          index,
      ),
    [product.image, product.images, product.title],
  );
  const activeImage = cardImages[imageIndex];
  const hasMultipleImages = cardImages.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) return;

    const preloadGallery = () => {
      cardImages.slice(1).forEach((image) => {
        const preload = new window.Image();
        preload.src = image.src;
      });
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(preloadGallery, {
        timeout: 2000,
      });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = globalThis.setTimeout(preloadGallery, 500);
    return () => globalThis.clearTimeout(timeoutId);
  }, [cardImages, hasMultipleImages]);

  // Detail-page sale price (`price`/`originalPrice`) when the admin has set
  // it; otherwise fall back to the card's min–max range so the card never
  // renders blank while a product is still being merchandised.
  const hasSalePrice = product.price != null;
  const unitPrice = product.price ?? product.priceMin;
  const unitMrp = product.originalPrice ?? unitPrice;

  function handleAddToCart() {
    setQuickAddOpen(true);
  }

  function showPreviousImage() {
    setImageIndex((current) =>
      current === 0 ? cardImages.length - 1 : current - 1,
    );
  }

  function showNextImage() {
    setImageIndex((current) => (current + 1) % cardImages.length);
  }

  return (
    <div className="group flex w-full flex-col">
      {/* IMAGE */}
      <div
        className={[
          "relative block w-full overflow-hidden",
          c.image.rounded,
          c.image.aspect,
          c.image.aspectSm,
          c.image.aspectLg,
        ].join(" ")}
      >
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.title}`}
          className="absolute inset-0"
        >
        {activeImage ? (
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
            className={[
              "object-cover transition-all duration-300",
              c.image.objectPositionCustom ? "" : c.image.position,
              c.image.zoom,
              "group-hover:scale-[1.04]",
            ].join(" ")}
            style={
              c.image.objectPositionCustom
                ? { objectPosition: c.image.objectPositionCustom }
                : undefined
            }
          />
        ) : (
          <div className="h-full w-full bg-[#f0f0f0]" />
        )}
        </Link>

        {hasMultipleImages && (
          <>
            <button
              type="button"
              aria-label={`Previous image of ${product.title}`}
              onClick={showPreviousImage}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-black/65 focus:opacity-100 group-hover:opacity-100"
            >
              <IconChevronLeft size={22} stroke={2} />
            </button>

            <button
              type="button"
              aria-label={`Next image of ${product.title}`}
              onClick={showNextImage}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-black/65 focus:opacity-100 group-hover:opacity-100"
            >
              <IconChevronRight size={22} stroke={2} />
            </button>

            <span className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
              {imageIndex + 1}/{cardImages.length}
            </span>
          </>
        )}
      </div>

      {/* TEXT BLOCK */}
      <div className={`flex flex-1 flex-col ${c.gapImageToText}`}>
        <Link href={`/product/${product.slug}`}>
          <h3
            className={[
              "min-h-[calc(1.3em*3)] leading-[1.3] text-[#111] transition-colors hover:text-[#f36d43]",
              c.title.lines,
              c.title.case,
              c.title.size,
              c.title.sizeSm,
              c.title.size1440,
              c.title.weight,
              c.title.weight1440,
            ].join(" ")}
          >
            {product.title}
          </h3>
        </Link>

        <div className={`flex items-center ${c.price.gapBetweenOldAndNew} ${c.gapTitleToPrice}`}>
          {hasSalePrice && product.originalPrice != null && (
            <span
              className={`text-[#999] line-through ${c.price.size} ${c.price.sizeSm} ${c.price.size1440}`}
            >
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          <span
            className={`font-bold text-[#111] ${c.price.size} ${c.price.sizeSm} ${c.price.size1440}`}
          >
            {hasSalePrice
              ? `₹${unitPrice.toLocaleString("en-IN")}`
              : formatPriceRange(product)}
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

      {quickAddOpen && (
        <QuickAddModal
          product={product}
          unitPrice={unitPrice}
          unitMrp={unitMrp}
          onClose={() => setQuickAddOpen(false)}
        />
      )}
    </div>
  );
}
