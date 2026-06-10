"use client";

import Image from "next/image";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { productBookmarkId } from "@/lib/bookmarks";
import type { Product } from "@/lib/products";
import { formatPriceRange } from "@/lib/products";
import CartLogin from "@/components/cart/CartLogin";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  IconShare3,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandFacebook,
  IconLink,
} from "@tabler/icons-react";

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

// Shared viewport height for frozen left/right panels on desktop.
const panelHeightClass = "lg:h-[calc(100dvh-95px)]";
const stickyPanelClass = `lg:sticky lg:top-[84px] lg:self-start ${panelHeightClass}`;

function GalleryImage({
  image,
  product,
  priority = false,
  fill = false,
}: {
  image: { src: string; alt: string };
  product: Product;
  priority?: boolean;
  /** Full viewport-height card on desktop (frozen side panels + middle scroll steps). */
  fill?: boolean;
}) {
  return (
    <div
      className={
        fill
          ? `aspect-[3/4] max-h-[650px] overflow-hidden rounded-lg lg:aspect-auto lg:max-h-none lg:w-full ${panelHeightClass}`
          : "aspect-[3/4] max-h-[650px] overflow-hidden rounded-lg"
      }
      style={{ backgroundColor: product.bg }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={700}
        height={900}
        priority={priority}
        className={`h-full w-full object-contain ${
          image.src.includes("back.png") ? "translate-y-[78px]" : ""
        }`}
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
  const [showCartLogin, setShowCartLogin] = useState(false);

  /* SHARE POPUP */
  const [showShare, setShowShare] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied!");
    } catch (error) {
      console.error(error);
    }
  };

  const [activeTab, setActiveTab] = useState<ProductTab>(
    "details & description",
  );

  const gallery = useMemo(() => getGallery(product), [product]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareRef.current &&
        !shareRef.current.contains(event.target as Node)
      ) {
        setShowShare(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        {/*
          Bluorng-style scroll: left + right are sticky (frozen) on desktop.
          The middle column stacks all remaining gallery cards and sets the
          section height — page scroll walks through those cards until the last
          one, then the section ends and the footer scrolls in normally.
        */}
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-3 px-3 py-4 lg:items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(580px,580px)] lg:py-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(650px,650px)] lg:px-4">
          {/* Frozen left — first gallery image */}
          <div className={stickyPanelClass}>
            {gallery[0] && (
              <GalleryImage
                image={gallery[0]}
                product={product}
                priority
                fill
              />
            )}
          </div>

          {/* Scrollable middle — remaining gallery cards drive page height */}
          <div className="flex flex-col gap-3">
            {gallery.slice(1).map((image, index) => (
              <GalleryImage
                key={`${image.src}-${index + 1}`}
                image={image}
                product={product}
                priority={index === 0}
                fill
              />
            ))}
          </div>

          {/* Frozen right — product info */}
          <div
            className={`flex min-h-0 min-w-0 flex-col gap-2 pb-2 lg:overflow-hidden lg:pb-3 ${stickyPanelClass}`}
          >
            <div className="shrink-0 rounded-lg border border-[#d8d8d8] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <h1 className="text-[24px] font-medium leading-tight text-black">
                    {product.title}
                  </h1>
                  <BookmarkButton
                    id={productBookmarkId(product.slug)}
                    className="shrink-0 text-[#111] transition-transform duration-200 hover:scale-110"
                  />
                </div>

                {product.rating != null && (
                  <span className="flex shrink-0 items-center gap-1 text-[20px] text-black">
                    <svg
                      viewBox="0 0 20 20"
                      fill="#f5b301"
                      className="h-7 w-3.5"
                      aria-hidden="true"
                    >
                      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8L1.58 7.62l5.82-.85L10 1.5z" />
                    </svg>
                    <span className="font-medium">{product.rating}</span>
                    {product.reviewCount != null && (
                      <span className="text-gray-500">
                        ({product.reviewCount})
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[24px] font-bold leading-none text-[#f97316]">
                  {hasSalePrice
                    ? inr(product.price as number)
                    : formatPriceRange(product)}
                </span>

                {product.originalPrice != null && (
                  <span className="text-base font-medium text-gray-400 line-through">
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

              <div className="mt-5">
                <div className="mb-2 flex w-full justify-start">
                  <button
                    type="button"
                    onClick={() => setShowGuide(true)}
                    className="rounded bg-[#e9e9e9] px-5 py-1.5 text-[11px] font-medium text-black transition-colors hover:bg-[#dedede]"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                  {productSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-h-[30px] rounded-full border px-2 py-1 text-[11px] transition ${
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

              <div className="mt-3 grid grid-cols-2 gap-5 max-[480px]:gap-2.5">
                <div>
                  <div className="mb-2 flex h-[22px] items-center justify-center rounded bg-[#d9d9d9] px-2 text-center text-[10px] leading-none text-black max-[480px]:text-[9px]">
                    Quantity
                  </div>

                  <div className="flex h-[26px] items-center justify-between rounded bg-white px-2 ring-1 ring-[#e5e5e5]">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((prev) => Math.max(1, prev - 1))
                      }
                      aria-label="Decrease quantity"
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-[#5a5555] text-[14px] leading-none text-white"
                    >
                      -
                    </button>

                    <span className="text-[18px] font-medium leading-none text-black">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      aria-label="Increase quantity"
                      className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#5a5555] text-[16px] font-light leading-none text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex h-[22px] items-center justify-center whitespace-nowrap rounded bg-[#d9d9d9] px-2 text-center text-[10px] leading-none text-black max-[480px]:text-[9px]">
                    Name and T-shirt Number
                  </div>

                  <div className="flex h-[26px] gap-2 max-[480px]:gap-1.5">
                    <input
                      type="text"
                      placeholder="NAME"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="h-full min-w-0 flex-1 rounded bg-white px-2 text-center text-[12px] uppercase leading-none text-black outline-none ring-1 ring-[#e5e5e5] focus:ring-black max-[480px]:px-1.5 max-[480px]:text-[11px]"
                    />

                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="07"
                      value={numberValue}
                      onChange={(e) => setNumberValue(e.target.value)}
                      className="h-full w-[46px] shrink-0 rounded bg-white text-center text-[12px] leading-none text-black outline-none ring-1 ring-[#e5e5e5] focus:ring-black max-[480px]:w-[38px] max-[480px]:text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex h-[58px] gap-3 max-[480px]:mt-4 max-[480px]:h-[54px] max-[480px]:gap-2">
                <button
                  type="button"
                  onClick={() => setShowCartLogin(true)}
                  className="flex min-w-0 flex-1 items-center justify-center gap-3 rounded-[10px] bg-[#f36d43] px-4 text-white transition-opacity hover:opacity-90 max-[480px]:gap-2 max-[480px]:px-3"
                >
                  <span className="flex min-w-0 flex-col items-start leading-none">
                    <span className="whitespace-nowrap text-[13px] font-semibold uppercase tracking-[1px] max-[480px]:text-[11px]">
                      ADD TO CART
                    </span>
                    {product.freeShippingRemaining != null && (
                      <span className="mt-1.5 whitespace-nowrap text-[10px] font-normal max-[480px]:text-[9px]">
                        {inr(product.freeShippingRemaining)} to free shipping
                      </span>
                    )}
                  </span>
                  <svg
                    viewBox="0 0 64 64"
                    fill="currentColor"
                    className="h-9 w-9 shrink-0 max-[480px]:h-8 max-[480px]:w-8"
                    aria-hidden="true"
                  >
                    <path d="M6 8h9.5l5.9 29.5a6 6 0 0 0 5.9 4.8h22.3a6 6 0 0 0 5.7-4.1L62 18H20.2l-1.4-7A4 4 0 0 0 14.9 8H6z" />
                    <circle cx="28" cy="53" r="5.5" />
                    <circle cx="49" cy="53" r="5.5" />
                  </svg>
                </button>

                <div ref={shareRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowShare((prev) => !prev)}
                    aria-label="Share Product"
                    className="flex h-full w-[46px] shrink-0 items-center justify-center rounded-[10px] border border-[#c8c8c8] bg-[#f4f4f4] text-black transition-colors hover:border-black max-[480px]:w-[42px]"
                  >
                    <IconShare3 size={22} stroke={1.8} />
                  </button>

                  {showShare && (
                    <div className="absolute right-0 top-[64px] z-50 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                      >
                        <IconBrandWhatsapp size={18} />
                        WhatsApp
                      </a>

                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          shareUrl,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                      >
                        <IconBrandX size={18} />X (Twitter)
                      </a>

                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          shareUrl,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                      >
                        <IconBrandFacebook size={18} />
                        Facebook
                      </a>

                      <button
                        type="button"
                        onClick={copyLink}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
                      >
                        <IconLink size={18} />
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 space-y-1.5 text-[12px] leading-5 text-black">
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
                  <p className="flex flex-wrap items-center gap-1">
                    <strong>Real-buyer size fit:</strong>{" "}
                    <span className="rounded-full bg-[#dff4eb] px-2 py-1 text-[11px] font-medium text-[#008c45]">
                      All sizes {product.fitPercent}% fit
                      {product.fitReviews != null && (
                        <span> ({product.fitReviews} reviews)</span>
                      )}
                    </span>
                  </p>
                )}

                <p className="text-gray-600">
                  Every piece is hygiene-sealed. COD all India{" "}
                  <span className="font-medium text-black">
                    pay only when it reaches you.
                  </span>
                </p>

                {product.prepaidPromo && (
                  <p className="font-medium text-green-600">
                    {product.prepaidPromo}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col overflow-hidden rounded-lg border border-[#d8d8d8] bg-white">
              <div className="grid shrink-0 grid-cols-3 border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`min-h-[36px] px-2 py-2 text-center text-[11px] capitalize ${
                      activeTab === tab
                        ? "border-b-2 border-black font-medium"
                        : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="max-h-[145px] overflow-y-auto overscroll-contain px-3 pt-3 pb-2 text-[11px] leading-normal text-gray-600">
                {activeTab === "details & description" && (
                  <>
                    <p className="font-medium text-black">Details</p>
                    {(product.details?.length
                      ? product.details
                      : [
                          product.type ?? "Premium apparel",
                          product.sleeve
                            ? `${product.sleeve} sleeve`
                            : "Comfort fit",
                          product.colors?.length
                            ? `Colours: ${product.colors.join(", ")}`
                            : "Designed for everyday wear",
                        ]
                    ).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    <p className="mt-3 font-medium text-black">Description</p>
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
      <CartLogin open={showCartLogin} onClose={() => setShowCartLogin(false)} />
    </>
  );
}
