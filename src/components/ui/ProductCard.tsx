"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { formatPriceRange } from "@/lib/products";
import type { Product } from "@/lib/products";
import QuickAddModal from "@/components/ui/QuickAddModal";

type Variant = "hoodie" | "polo";

// Quick-add starts at L; customers can adjust it with the cart size controls.
const DEFAULT_SIZE = "L";

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
  const { addItem } = useCart();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Detail-page sale price (`price`/`originalPrice`) when the admin has set
  // it; otherwise fall back to the card's min–max range so the card never
  // renders blank while a product is still being merchandised.
  const hasSalePrice = product.price != null;
  const unitPrice = product.price ?? product.priceMin;
  const unitMrp = product.originalPrice ?? unitPrice;

  // Jerseys (name & number enabled) open a popup so the customer picks a size
  // and types their name/number first; everything else quick-adds at size L.
  function handleAddToCart() {
    if (product.allowCustomName) {
      setQuickAddOpen(true);
      return;
    }
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
      <Link
        href={`/product/${product.slug}`}
        className={[
          "relative block w-full overflow-hidden",
          c.image.rounded,
          c.image.aspect,
          c.image.aspectSm,
          c.image.aspectLg,
        ].join(" ")}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
            className={[
              "object-cover transition-transform duration-300",
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
