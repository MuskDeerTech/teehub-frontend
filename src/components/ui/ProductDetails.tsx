"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { productBookmarkId } from "@/lib/bookmarks";
import type { Product } from "@/lib/products";
import { formatPriceRange } from "@/lib/products";

const fallbackSizes = ["XS", "S", "M", "L", "XL", "XXL"];
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
        src: "/images/Price-detail/rcb-pricedetailR.png",
        alt: `${product.title} back view`,
      },
    ];
  }

  if (product.image) {
    return [{ src: product.image, alt: product.title }];
  }

  return [];
}

export default function ProductDetails({ product }: { product: Product }) {
  const productSizes = product.sizes?.length ? product.sizes : fallbackSizes;
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(productSizes[0]);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] =
    useState<ProductTab>("details & description");

  const gallery = useMemo(() => getGallery(product), [product]);
  const mainImage = gallery[0];

  return (
    <>
      <section className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 bg-[#EFEFEF] px-4 py-5 md:grid-cols-[minmax(280px,420px)_1fr] lg:grid-cols-[360px_minmax(320px,1fr)_420px] lg:px-6">
        <div className="min-w-0">
          <div
            className="aspect-[3/4] overflow-hidden rounded-lg"
            style={{ backgroundColor: product.bg }}
          >
            {mainImage ? (
              <Image
                src={mainImage.src}
                alt={mainImage.alt}
                width={700}
                height={900}
                priority
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>
        </div>

        <div className="min-w-0 space-y-3 lg:max-h-[800px] lg:overflow-y-auto lg:pr-1">
          {gallery.map((image) => (
            <div
              key={image.src}
              className="aspect-[3/4] overflow-hidden rounded-lg"
              style={{ backgroundColor: product.bg }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={700}
                height={900}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>

        <div className="min-w-0 lg:max-h-[800px] lg:overflow-y-auto lg:pr-1">
          <div className="rounded-lg border border-[#ddd] bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-[24px] font-medium leading-tight text-black">
                {product.title}
              </h1>
              <BookmarkButton
                id={productBookmarkId(product.slug)}
                className="shrink-0 text-[#111] transition-transform duration-200 hover:scale-110"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[34px] font-bold leading-none text-[#f97316]">
                {formatPriceRange(product)}
              </span>
            </div>

            <p className="mt-1 text-sm text-green-600">
              COD available on eligible orders
            </p>

            <div className="mt-5">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="shrink-0 rounded bg-[#e9e9e9] px-7 py-2 text-[11px] font-medium text-black transition-colors hover:bg-[#dedede]"
                >
                  Size Guide
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
                {productSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-h-[40px] rounded-full border px-4 py-2 text-sm transition ${
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

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 rounded bg-[#E9E9E9] py-2 text-center text-sm">
                  Quantity
                </div>

                <div className="flex min-h-[47px] items-center justify-between rounded bg-white px-3 py-2 ring-1 ring-[#e5e5e5]">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-6 w-6 items-center justify-center rounded bg-black text-white"
                  >
                    -
                  </button>

                  <span className="text-[20px] font-medium">{quantity}</span>

                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    aria-label="Increase quantity"
                    className="flex h-6 w-6 items-center justify-center rounded bg-black text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 rounded bg-[#E9E9E9] py-2 text-center text-sm">
                  Name and T-shirt Number
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="NAME"
                    className="h-[47px] min-w-0 flex-1 rounded bg-white px-3 outline-none ring-1 ring-[#e5e5e5] focus:ring-black"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="07"
                    className="h-[47px] w-[56px] rounded bg-white text-center outline-none ring-1 ring-[#e5e5e5] focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                className="min-h-[56px] flex-1 rounded bg-[#EB6434E5] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                ADD TO CART
              </button>

              <button
                type="button"
                aria-label="Contact on WhatsApp"
                className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded border border-green-500 text-green-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 35 37"
                  fill="currentColor"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M16.04 3C8.84 3 3 8.72 3 15.78c0 2.47.72 4.86 2.08 6.92L3 29l6.53-2.02a13.2 13.2 0 006.51 1.72C23.24 28.7 29 22.98 29 15.92 29 8.72 23.24 3 16.04 3zm7.7 18.04c-.32.88-1.86 1.68-2.58 1.8-.66.1-1.5.15-2.42-.14-.56-.18-1.28-.42-2.2-.82-3.88-1.68-6.4-5.62-6.6-5.88-.18-.26-1.58-2.1-1.58-4.02s1-2.86 1.36-3.24c.36-.38.78-.48 1.04-.48h.74c.24 0 .56-.08.88.7.32.78 1.08 2.7 1.18 2.9.1.2.16.44.04.7-.12.26-.18.42-.36.64-.18.22-.38.48-.54.64-.18.18-.38.38-.16.74.22.36.98 1.62 2.1 2.62 1.44 1.28 2.66 1.68 3.04 1.86.38.18.6.16.82-.1.22-.26.94-1.1 1.2-1.48.26-.38.52-.32.88-.2.36.12 2.28 1.08 2.66 1.28.38.2.64.3.74.48.1.18.1 1.02-.22 1.9z" />
                </svg>
              </button>
            </div>

            <div className="mt-6 text-sm leading-6 text-black">
              <p>
                <strong>Highly stretchable fabric.</strong> Order by your size
                and it will hug right.
              </p>

              <p className="mt-3">
                <strong>Real-buyer size fit:</strong> Available sizes are based
                on current product stock.
              </p>

              <p className="mt-3 text-gray-600">
                Every piece is hygiene-sealed. COD available only when it
                reaches you.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded border">
              <div className="grid grid-cols-3 border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`min-h-[48px] px-2 py-3 text-center text-xs capitalize sm:text-sm ${
                      activeTab === tab ? "border-b-2 border-black font-medium" : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4 text-sm leading-6 text-gray-600">
                {activeTab === "details & description" && (
                  <>
                    <p className="font-medium text-black">Details</p>
                    <p>{product.type ?? "Premium apparel"}</p>
                    <p>{product.sleeve ? `${product.sleeve} sleeve` : "Comfort fit"}</p>
                    <p>
                      {product.colors?.length
                        ? `Colours: ${product.colors.join(", ")}`
                        : "Designed for everyday wear"}
                    </p>
                    <p className="mt-4 font-medium text-black">Description</p>
                    <p>
                      {product.title} is built for a clean TeeHub fit with a
                      sharp finish and comfortable daily wear.
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
