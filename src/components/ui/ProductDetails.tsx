"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { productBookmarkId } from "@/lib/bookmarks";
import type { Product } from "@/lib/products";
import { formatPriceRange } from "@/lib/products";

const fallbackSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const tabs = ["details & description", "washcare", "shipping"] as const;

type ProductTab = (typeof tabs)[number];

function getGallery(product: Product) {
  if (product.slug === "rcb-jersey-2026") {
    return [
      {
        src: "/images/Price-detail/rcb-pricedetailL.png",
        alt: `${product.title} front view`,
      },
      {
        src: "/images/Price-detail/rcb-pricedetailL.png",
        alt: `${product.title} front view duplicate`,
      },
      {
        src: "/images/Price-detail/rcb-pricedetailR.png",
        alt: `${product.title} second angle view`,
      },
      {
        src: "/images/ipl-jersey/back.png",
        alt: `${product.title} alternate view`,
      },
    ];
  }

  if (product.image) {
    return [{ src: product.image, alt: product.title }];
  }

  return [];
}

const inr = (n: number) => `₹${n}`;

function GalleryImage({
  image,
  product,
  priority = false,
}: {
  image: { src: string; alt: string };
  product: Product;
  priority?: boolean;
}) {
  return (
    <div
      className="aspect-[3/4] max-h-[650px] overflow-hidden rounded-lg"
      style={{ backgroundColor: product.bg }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={700}
        height={900}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export default function ProductDetails({ product }: { product: Product }) {
  const productSizes = product.detailSizes?.length
    ? product.detailSizes
    : fallbackSizes;
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(productSizes[0]);
  const [nameValue, setNameValue] = useState("MRUDULA");
  const [numberValue, setNumberValue] = useState("07");
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] =
    useState<ProductTab>("details & description");

  const gallery = useMemo(() => getGallery(product), [product]);

  // The detail page shows a single sale price with the struck-through MRP +
  // discount when `price` is set; otherwise it falls back to the catalog range.
  const hasSalePrice = product.price != null;
  const savedAmount =
    product.originalPrice != null && product.price != null
      ? product.originalPrice - product.price
      : null;

  return (
    <>
      <section className="w-full bg-[#EFEFEF]">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-3 px-3 py-4 lg:items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(460px,500px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(500px,540px)] lg:px-4">
        <div className="lg:sticky lg:top-[92px] lg:h-fit lg:self-start">
          {gallery[0] && (
            <GalleryImage image={gallery[0]} product={product} priority />
          )}
        </div>

        <div className="grid gap-3">
          {gallery.slice(1).map((image, index) => (
            <GalleryImage
              key={`${image.src}-${index + 1}`}
              image={image}
              product={product}
            />
          ))}
        </div>

        <div className="min-w-0 lg:sticky lg:top-[92px] lg:h-fit lg:self-start">
          <div className="rounded-lg border border-[#d8d8d8] bg-white p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="text-[15px] font-medium leading-tight text-black">
                  {product.title}
                </h1>
                <BookmarkButton
                  id={productBookmarkId(product.slug)}
                  className="shrink-0 text-[#111] transition-transform duration-200 hover:scale-110"
                />
              </div>

              {product.rating != null && (
                <span className="flex shrink-0 items-center gap-1 text-[12px] text-black">
                  <svg
                    viewBox="0 0 20 20"
                    fill="#f5b301"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8L1.58 7.62l5.82-.85L10 1.5z" />
                  </svg>
                  <span className="font-medium">{product.rating}</span>
                  {product.reviewCount != null && (
                    <span className="text-gray-500">({product.reviewCount})</span>
                  )}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-[26px] font-bold leading-none text-[#f97316]">
                {hasSalePrice ? inr(product.price as number) : formatPriceRange(product)}
              </span>

              {product.originalPrice != null && (
                <span className="text-sm font-medium text-gray-400 line-through">
                  {inr(product.originalPrice)}
                </span>
              )}

              {product.discountPercent != null && (
                <span className="rounded bg-[#f97316] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  -{product.discountPercent}%
                </span>
              )}
            </div>

            {savedAmount != null && savedAmount > 0 && (
              <p className="mt-0.5 text-[12px] text-green-600">
                You saved {inr(savedAmount)}
              </p>
            )}

            <div className="mt-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="shrink-0 rounded bg-[#e9e9e9] px-5 py-1.5 text-[10px] font-medium text-black transition-colors hover:bg-[#dedede]"
                >
                  Size Guide
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {productSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-h-[26px] rounded-full border px-2 py-1 text-[10px] transition ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-[#d6d6d6] bg-white text-black hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 max-[480px]:gap-4">
              <div>
                <div className="mb-1.5 flex h-[24px] items-center justify-center rounded bg-[#d9d9d9] px-2 text-center text-[12px] leading-none text-black max-[480px]:text-[11px]">
                  Quantity
                </div>

                <div className="flex h-[29px] items-center justify-between rounded bg-white px-2 ring-1 ring-[#e5e5e5]">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#5a5555] text-[16px] leading-none text-white"
                  >
                    -
                  </button>

                  <span className="text-[22px] font-medium leading-none text-black">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    aria-label="Increase quantity"
                    className="flex h-4.5 w-4.5 items-center justify-center rounded-sm bg-[#5a5555] text-[20px] font-light leading-none text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex h-[24px] items-center justify-center whitespace-nowrap rounded bg-[#d9d9d9] px-2 text-center text-[12px] leading-none text-black max-[480px]:text-[10px]">
                  Name and T-shirt Number
                </div>

                <div className="flex h-[29px] gap-3 max-[480px]:gap-2">
                  <input
                    type="text"
                    placeholder="NAME"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="h-full min-w-0 flex-1 rounded bg-white px-3 text-center text-[15px] uppercase leading-none text-black outline-none ring-1 ring-[#e5e5e5] focus:ring-black max-[480px]:px-2 max-[480px]:text-[13px]"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="07"
                    value={numberValue}
                    onChange={(e) => setNumberValue(e.target.value)}
                    className="h-full w-[54px] shrink-0 rounded bg-white text-center text-[15px] leading-none text-black outline-none ring-1 ring-[#e5e5e5] focus:ring-black max-[480px]:w-[42px] max-[480px]:text-[13px]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex h-[64px] gap-3 max-[480px]:mt-8 max-[480px]:h-[58px] max-[480px]:gap-2">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center justify-center gap-3 rounded-[10px] bg-[#f36d43] px-4 text-white transition-opacity hover:opacity-90 max-[480px]:gap-2 max-[480px]:px-3"
              >
                <span className="flex min-w-0 flex-col items-start leading-none">
                  <span className="whitespace-nowrap text-[13px] font-semibold uppercase tracking-[1px] max-[480px]:text-[11px]">
                    ADD TO CART
                  </span>
                  {product.freeShippingRemaining != null && (
                    <span className="mt-2 whitespace-nowrap text-[10px] font-normal max-[480px]:text-[9px]">
                      {inr(product.freeShippingRemaining)} to free shipping
                    </span>
                  )}
                </span>
                <svg
                  viewBox="0 0 64 64"
                  fill="currentColor"
                  className="h-10 w-10 shrink-0 max-[480px]:h-9 max-[480px]:w-9"
                  aria-hidden="true"
                >
                  <path d="M6 8h9.5l5.9 29.5a6 6 0 0 0 5.9 4.8h22.3a6 6 0 0 0 5.7-4.1L62 18H20.2l-1.4-7A4 4 0 0 0 14.9 8H6z" />
                  <circle cx="28" cy="53" r="5.5" />
                  <circle cx="49" cy="53" r="5.5" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Add to wishlist"
                className="flex h-full w-[46px] shrink-0 items-center justify-center rounded-[10px] border border-[#c8c8c8] bg-[#f4f4f4] text-black transition-colors hover:border-black max-[480px]:w-[42px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 max-[480px]:h-5 max-[480px]:w-5"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Contact on WhatsApp"
                className="flex h-full w-[46px] shrink-0 items-center justify-center rounded-[10px] border border-[#2fb653] bg-[#e9f8ef] text-[#2fc454] max-[480px]:w-[42px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 35 37"
                  fill="currentColor"
                  className="h-7 w-7 max-[480px]:h-6 max-[480px]:w-6"
                  aria-hidden="true"
                >
                  <path d="M16.04 3C8.84 3 3 8.72 3 15.78c0 2.47.72 4.86 2.08 6.92L3 29l6.53-2.02a13.2 13.2 0 006.51 1.72C23.24 28.7 29 22.98 29 15.92 29 8.72 23.24 3 16.04 3zm7.7 18.04c-.32.88-1.86 1.68-2.58 1.8-.66.1-1.5.15-2.42-.14-.56-.18-1.28-.42-2.2-.82-3.88-1.68-6.4-5.62-6.6-5.88-.18-.26-1.58-2.1-1.58-4.02s1-2.86 1.36-3.24c.36-.38.78-.48 1.04-.48h.74c.24 0 .56-.08.88.7.32.78 1.08 2.7 1.18 2.9.1.2.16.44.04.7-.12.26-.18.42-.36.64-.18.22-.38.48-.54.64-.18.18-.38.38-.16.74.22.36.98 1.62 2.1 2.62 1.44 1.28 2.66 1.68 3.04 1.86.38.18.6.16.82-.1.22-.26.94-1.1 1.2-1.48.26-.38.52-.32.88-.2.36.12 2.28 1.08 2.66 1.28.38.2.64.3.74.48.1.18.1 1.02-.22 1.9z" />
                </svg>
              </button>
            </div>

            <div className="mt-5 text-[12px] leading-5 text-black">
              <p>
                <strong>Highly stretchable fabric.</strong> Order by your{" "}
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="font-medium text-blue-600 underline"
                >
                  waist size
                </button>{" "}
                it&apos;ll hug right.
              </p>

              {product.fitPercent != null && (
                <p className="mt-2 flex flex-wrap items-center gap-1.5">
                  <strong>Real-buyer size fit:</strong>{" "}
                  <span className="rounded-full bg-[#dff4eb] px-2 py-1 text-[11px] font-medium text-[#008c45]">
                    All sizes {product.fitPercent}% fit
                    {product.fitReviews != null && (
                      <span> ({product.fitReviews} reviews)</span>
                    )}
                  </span>
                </p>
              )}

              <p className="mt-2 text-gray-600">
                Every piece is hygiene-sealed. COD all India{" "}
                <span className="font-medium text-black">
                  pay only when it reaches you.
                </span>
              </p>

              {product.prepaidPromo && (
                <p className="mt-2 font-medium text-green-600">
                  {product.prepaidPromo}
                </p>
              )}
            </div>

          </div>

          <div className="mt-3 overflow-hidden rounded-lg border border-[#d8d8d8] bg-white">
            <div className="overflow-hidden rounded border border-transparent bg-white">
              <div className="grid grid-cols-3 border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`min-h-[34px] px-2 py-2 text-center text-[10px] capitalize ${
                      activeTab === tab ? "border-b-2 border-black font-medium" : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-3 text-[10px] leading-4 text-gray-600">
                {activeTab === "details & description" && (
                  <>
                    <p className="font-medium text-black">Details</p>
                    {(product.details?.length
                      ? product.details
                      : [
                          product.type ?? "Premium apparel",
                          product.sleeve ? `${product.sleeve} sleeve` : "Comfort fit",
                          product.colors?.length
                            ? `Colours: ${product.colors.join(", ")}`
                            : "Designed for everyday wear",
                        ]
                    ).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <p className="mt-4 font-medium text-black">Description</p>
                    <p>
                      {product.description ??
                        `${product.title} is built for a clean TeeHub fit with a sharp finish and comfortable daily wear.`}
                    </p>
                  </>
                )}

                {activeTab === "washcare" && (
                  <p>Machine wash cold. Do not bleach.</p>
                )}

                {activeTab === "shipping" && (
                  <p>Standard delivery within 5-7 business days.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-[500px] rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Size Guide</h2>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close size guide"
                className="text-lg"
              >
                x
              </button>
            </div>

            <div className="space-y-2">
              <p>XS - 34-36 inches</p>
              <p>S - 36-38 inches</p>
              <p>M - 38-40 inches</p>
              <p>L - 40-42 inches</p>
              <p>XL - 42-44 inches</p>
              <p>XXL - 44-46 inches</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
