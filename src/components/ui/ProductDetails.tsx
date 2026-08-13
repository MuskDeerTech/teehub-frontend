"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  IconBrandWhatsapp,
  IconFlameFilled,
  IconMessage,
  IconRuler2,
  IconStarFilled,
  IconTruckDelivery,
} from "@tabler/icons-react";
import BookmarkButton from "@/components/ui/BookmarkButton";
import SizeGuideModal from "@/components/ui/SizeGuideModal";
import QuickAddModal from "@/components/ui/QuickAddModal";
import OffersCard from "@/components/product/OffersCard";
import ProductAccordion from "@/components/product/ProductAccordion";
import { PrepaidBox, SocialProofChips } from "@/components/product/SocialProof";
import { productBookmarkId } from "@/lib/bookmarks";
import { useCart } from "@/components/cart/CartContext";
import type { ImageFit, Product } from "@/lib/products";
import {
  defaultSize,
  fitTransform,
  formatPriceRange,
  isSizeAvailable,
  resolveDetailSizes,
} from "@/lib/products";
import type { ProductPageSettings } from "@/lib/productPage";

/** Prices render with Indian grouping everywhere (₹1,200), matching the cart
 *  and quick-add popup. */
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getGallery(product: Product) {
  // CMS products carry their own gallery (uploaded in the Payload admin);
  // the hardcoded fallbacks below only cover legacy static data.
  if (product.images?.length) {
    return product.images.map((img) => ({
      src: img.src,
      alt: img.alt || product.title,
      fit: img.fit,
    }));
  }

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

type GalleryEntry = { src: string; alt: string; fit?: ImageFit };

// Shared viewport height for frozen left/right panels on desktop.
const panelHeightClass = "lg:h-[calc(100dvh-94px)]";
const stickyPanelClass = `lg:sticky lg:top-[84px] lg:self-start relative z-0 ${panelHeightClass}`;

function GalleryImage({
  image,
  product,
  priority = false,
  fill = false,
  badge,
  onPreview,
}: {
  image: GalleryEntry;
  product: Product;
  priority?: boolean;
  /** Full viewport-height card on desktop (frozen side panels + middle scroll steps). */
  fill?: boolean;
  /** Social-proof overlay, only ever on the lead image. */
  badge?: string;
  onPreview?: () => void;
}) {
  return (
    <div
      role={onPreview ? "button" : undefined}
      tabIndex={onPreview ? 0 : undefined}
      aria-label={onPreview ? `View larger image: ${image.alt}` : undefined}
      onClick={onPreview}
      onKeyDown={
        onPreview
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPreview();
              }
            }
          : undefined
      }
      className={`relative ${
        fill
          ? `aspect-[3/4] max-h-[650px] overflow-hidden rounded-lg lg:aspect-auto lg:max-h-none lg:w-full ${panelHeightClass}${onPreview ? " cursor-pointer transition-opacity hover:opacity-95" : ""}`
          : `aspect-[3/4] max-h-[650px] overflow-hidden rounded-lg${onPreview ? " cursor-pointer transition-opacity hover:opacity-95" : ""}`
      }`}
      style={{ backgroundColor: product.bg }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={700}
        height={900}
        priority={priority}
        className="pointer-events-none h-full w-full origin-center object-cover"
        style={fitTransform(image.fit)}
      />

      {/* Comment glyph before the copy and a flame after it, per the design —
          the count reads as chatter about the product rather than a bare label. */}
      {badge && (
        <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/90 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <IconMessage size={12} stroke={2} aria-hidden="true" />
          {badge}
          <IconFlameFilled
            size={12}
            aria-hidden="true"
            className="text-[#ff5b1f]"
          />
        </span>
      )}
    </div>
  );
}

function ImageLightbox({
  images,
  index,
  product,
  onClose,
  onChangeIndex,
}: {
  images: GalleryEntry[];
  index: number;
  product: Product;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}) {
  const image = images[index];
  const hasMultiple = images.length > 1;
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("image-preview-open");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (!hasMultiple) return;

      if (event.key === "ArrowLeft") {
        onChangeIndex((index - 1 + images.length) % images.length);
      } else if (event.key === "ArrowRight") {
        onChangeIndex((index + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove("image-preview-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasMultiple, images.length, index, onChangeIndex, onClose]);

  if (!image || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Product image preview"
    >
      <button
        type="button"
        aria-label="Close image preview"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
      >
        ×
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() =>
              onChangeIndex((index - 1 + images.length) % images.length)
            }
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 sm:left-6"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={() => onChangeIndex((index + 1) % images.length)}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 sm:right-6"
          >
            ›
          </button>
        </>
      )}

      <div className="relative z-10 flex max-h-[90vh] max-w-[min(1200px,92vw)] flex-col items-center">
        <div
          className="relative flex max-h-[85vh] w-full items-center justify-center overflow-hidden rounded-lg"
          style={{ backgroundColor: product.bg }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={1400}
            height={1800}
            className="max-h-[85vh] w-auto max-w-full origin-bottom object-contain object-[50%_90%]"
            style={fitTransform(image.fit)}
          />
        </div>

        {hasMultiple && (
          <p className="mt-3 text-sm text-white/70">
            {index + 1} / {images.length}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function ProductDetails({
  product,
  settings,
  deliveryDate,
  reviews,
}: {
  product: Product;
  settings: ProductPageSettings;
  /** Pre-formatted on the server so the estimate can't shift with the client clock. */
  deliveryDate: string;
  /** Server-rendered Ratings & Reviews block, slotted under the gallery. */
  reviews?: ReactNode;
}) {
  const router = useRouter();
  const { addItem, closeCart, cartOpen } = useCart();

  const sizes = useMemo(() => resolveDetailSizes(product), [product]);
  const [selectedSize, setSelectedSize] = useState(() => defaultSize(sizes));
  const [quantity, setQuantity] = useState(1);
  const [showGuide, setShowGuide] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mobileGalleryIndex, setMobileGalleryIndex] = useState(0);
  // Which button opened the Name & Number popup — Buy Now carries on to
  // checkout once the customisation is captured, Add to Cart just closes.
  const [nameIntent, setNameIntent] = useState<"cart" | "buy" | null>(null);

  const gallery = useMemo(() => getGallery(product), [product]);
  const openPreview = (index: number) => setLightboxIndex(index);

  const handleMobileGalleryScroll = (
    event: React.UIEvent<HTMLDivElement>,
  ) => {
    const el = event.currentTarget;
    const nextIndex = Math.round(el.scrollLeft / el.clientWidth);
    setMobileGalleryIndex(Math.min(Math.max(nextIndex, 0), gallery.length - 1));
  };

  // A genuine discount shows the sale price with the struck-through MRP +
  // badge. Otherwise the catalog range renders instead — for variable products
  // that spans the customization options (e.g. ₹999 – ₹1,399), not just the
  // cheapest one.
  const hasSale =
    product.price != null &&
    product.originalPrice != null &&
    product.originalPrice > product.price;

  const unitPrice = product.price ?? product.priceMin;
  const unitMrp = product.originalPrice ?? product.price ?? product.priceMin;
  const selectedInStock = sizes.some(
    (size) => size.label === selectedSize && isSizeAvailable(size),
  );

  const goToCheckout = () => {
    // addItem opens the drawer; Buy Now skips it and heads straight to the
    // address step instead.
    closeCart();
    router.push("/checkout/address");
  };

  /** Add to Cart / Buy Now. Jerseys detour through the popup first so the name
   *  and number are captured before the line is created. */
  const handlePurchase = (intent: "cart" | "buy") => {
    if (product.allowCustomName) {
      setNameIntent(intent);
      return;
    }

    addItem({
      id: product.slug,
      name: product.title,
      image: product.image ?? gallery[0]?.src ?? "",
      size: selectedSize,
      availableSizes: sizes.filter(isSizeAvailable).map((size) => size.label),
      quantity,
      price: unitPrice,
      mrp: unitMrp,
    });

    if (intent === "buy") goToCheckout();
  };

  const accordionSections = [
    {
      title: "Details & Description",
      body: (
        <>
          <p className="font-medium text-[#111]">Details</p>
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
          <p className="mt-3 font-medium text-[#111]">Description</p>
          <p>
            {product.description ??
              `${product.title} is built for a clean TeeHub fit with a sharp finish and comfortable daily wear.`}
          </p>
        </>
      ),
    },
    // Product copy wins; otherwise the store-wide default from the CMS.
    // `whitespace-pre-line` keeps the line breaks the admin typed into the
    // textarea — without it HTML collapses them into one run-on paragraph.
    {
      title: "Wash care",
      body: (
        <p className="whitespace-pre-line">
          {product.washCare ?? settings.washCare}
        </p>
      ),
      skip: !product.washCare && !settings.washCare,
    },
    {
      title: "Shipping",
      body: (
        <p className="whitespace-pre-line">
          {product.shippingInfo ?? settings.shipping}
        </p>
      ),
      skip: !product.shippingInfo && !settings.shipping,
    },
  ]
    .filter((section) => !section.skip)
    .map(({ title, body }) => ({ title, body }));

  return (
    <div
      style={{
        isolation: "isolate",
        position: "relative",
        zIndex: cartOpen ? -1 : "auto",
      }}
    >
      {/* Gallery columns run 1.55:1 — the design's big lead image beside a
          narrower stack, measured off the Figma frame. */}
      <div className="mx-auto flex w-full flex-col gap-3 px-3 py-4 lg:px-4 lg:py-3">
        <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(420px,420px)] lg:items-start xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(650px,650px)]">
        <div className="min-w-0 lg:col-span-2 lg:row-start-1">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        {/* Mobile/tablet gallery — horizontal swipe before the product info. */}
        {gallery.length > 0 && (
          <div className="lg:hidden">
            <div
              onScroll={handleMobileGalleryScroll}
              className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
            >
              {gallery.map((image, index) => (
                <div
                  key={`${image.src}-${index}`}
                  className="w-full shrink-0 snap-center"
                >
                  <div className="relative">
                    <GalleryImage
                      image={image}
                      product={product}
                      priority={index === 0}
                      badge={index === 0 ? product.conversionsBadge : undefined}
                      onPreview={() => openPreview(index)}
                    />
                    {gallery.length > 1 && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[12px] font-semibold text-white">
                        {mobileGalleryIndex + 1} / {gallery.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frozen left — first gallery image */}
        <div className={`hidden lg:block ${stickyPanelClass}`}>
          {gallery[0] && (
            <GalleryImage
              image={gallery[0]}
              product={product}
              priority
              fill
              badge={product.conversionsBadge}
              onPreview={() => openPreview(0)}
            />
          )}
        </div>

        {/* Scrollable middle*/}
        <div className="relative z-0 hidden flex-col gap-3 lg:flex">
          {gallery.slice(1).map((image, index) => (
            <GalleryImage
              key={`${image.src}-${index + 1}`}
              image={image}
              product={product}
              priority={index === 0}
              fill
              onPreview={() => openPreview(index + 1)}
            />
          ))}
        </div>

          </div>
        </div>

        {/* The purchase stack stays beside the complete product region,
            including Reviews, then releases when that region ends. Because it
            is sticky rather than fixed, the recommendations and footer scroll
            normally once this parent grid has passed. */}
        <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-[84px] lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:self-start">
          {/* Grey card, white controls. The design leans on that contrast to
              make the size pills and quantity stepper read as controls — on a
              white card they only showed through their own thin borders. */}
          <div className="rounded-xl border border-[#e2e2e2] bg-[#f7f7f7] p-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="min-w-0 text-[20px] font-bold leading-snug text-black">
                {product.title}
              </h1>
              <BookmarkButton
                id={productBookmarkId(product.slug)}
                className="mt-1 shrink-0 text-[#111] transition-transform duration-200 hover:scale-110"
              />
            </div>

            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="flex flex-wrap items-baseline gap-2">
                <span className="text-[26px] font-bold leading-none text-[#111]">
                  {hasSale ? inr(unitPrice) : formatPriceRange(product)}
                </span>

                {hasSale && product.originalPrice != null && (
                  <span className="text-[14px] font-medium text-[#9a9a9a] line-through">
                    {inr(product.originalPrice)}
                  </span>
                )}

                {hasSale && product.discountPercent != null && (
                  <span className="text-[12px] font-semibold text-[#6b6b6b]">
                    -{product.discountPercent}%
                  </span>
                )}
              </span>

              {/* Star, score and count all carry the star's amber in the design,
                  so the colour sits on the wrapper rather than per-child. */}
              {product.rating != null && (
                <span className="flex shrink-0 items-center gap-1 text-[13px] text-[#f5b301]">
                  <IconStarFilled size={14} aria-hidden="true" />
                  <span className="font-semibold">{product.rating}</span>
                  {product.reviewCount != null && (
                    <span>({product.reviewCount})</span>
                  )}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-[#9a9a9a]">
              <span>{settings.taxNote}</span>
              {product.sku && <span>SKU: {product.sku}</span>}
            </div>

            <SocialProofChips chips={product.socialProof ?? []} />

            <PrepaidBox
              price={product.prepaidPrice}
              note={product.prepaidNote}
              badge={product.prepaidBadge}
            />

            {/* Size */}
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-[#111]">Size</span>
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[#111] underline underline-offset-2 hover:text-[#f36d43]"
                >
                  <IconRuler2 size={14} stroke={1.8} aria-hidden="true" />
                  Size Guide
                </button>
              </div>

              {/* Equal-width cells, so XS and XXL are the same size as in the
                  design instead of hugging their label. Capped at seven per row:
                  the usual XS–XXXL run lands on one row, and a longer size list
                  wraps while every pill keeps the same width. */}
              <div
                className="mt-2 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(sizes.length, 7)}, minmax(0, 1fr))`,
                }}
              >
                {sizes.map((size) => {
                  const available = isSizeAvailable(size);
                  const active = selectedSize === size.label;
                  return (
                    <button
                      key={size.label}
                      type="button"
                      disabled={!available}
                      aria-label={
                        available ? size.label : `${size.label} — out of stock`
                      }
                      onClick={() => setSelectedSize(size.label)}
                      className={`relative overflow-hidden rounded-lg border py-2 text-[13px] font-medium transition ${
                        !available
                          ? "cursor-not-allowed border-[#dcdcdc] bg-[#e6e6e6] text-[#a8a8a8]"
                          : active
                            ? "border-black bg-black text-white"
                            : "cursor-pointer border-[#d6d6d6] bg-white text-black hover:border-black"
                      }`}
                    >
                      {size.label}
                      {/* Diagonal slash across a sold-out pill. Clipped by
                          `overflow-hidden`, so it reads corner to corner. */}
                      {!available && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-[32deg] bg-[#b0b0b0]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + delivery estimate + save/WhatsApp */}
            <div className="mt-4">
              <span className="text-[13px] font-medium text-[#111]">
                Quantity
              </span>

              <div className="mt-2 flex items-center gap-2.5">
                {/* Segmented control: the two buttons and the count each get
                    their own cell divided by a rule. Plus sits on the left and
                    minus on the right — unconventional, but that's the order in
                    the design, in both the full page and the panel detail. */}
                <div className="flex h-11 shrink-0 items-stretch overflow-hidden rounded-lg border border-[#d6d6d6] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    aria-label="Increase quantity"
                    className="flex w-10 cursor-pointer items-center justify-center text-[18px] leading-none text-[#555] transition-colors hover:bg-[#fafafa] hover:text-black"
                  >
                    +
                  </button>
                  <span className="flex w-12 items-center justify-center border-x border-[#d6d6d6] text-[15px] font-semibold text-black">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Decrease quantity"
                    className="flex w-10 cursor-pointer items-center justify-center text-[18px] leading-none text-[#555] transition-colors hover:bg-[#fafafa] hover:text-black"
                  >
                    −
                  </button>
                </div>

                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.3px] text-[#0f7a45]">
                    {settings.deliveryLabel}
                    <IconTruckDelivery
                      size={14}
                      stroke={1.8}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="truncate text-[10px] text-[#8a8a8a]">
                    Get it by {deliveryDate}
                  </span>
                </div>

                <BookmarkButton
                  id={productBookmarkId(product.slug)}
                  variant="heart"
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#d6d6d6] bg-white text-[#111] transition-colors hover:border-black"
                />

                {settings.whatsappNumber && (
                  <a
                    href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                      `Hi! I'd like to know more about ${product.title}.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ask about this product on WhatsApp"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#1eb955] bg-[#25d366] text-white transition-opacity hover:opacity-90"
                  >
                    <IconBrandWhatsapp size={22} stroke={1.9} />
                  </a>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!selectedInStock}
                onClick={() => handlePurchase("cart")}
                className="flex h-12 items-center justify-center rounded-lg bg-black text-[13px] font-semibold uppercase tracking-[0.5px] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#c9c9c9]"
              >
                {selectedInStock ? "Add to Cart" : "Out of Stock"}
              </button>

              <button
                type="button"
                disabled={!selectedInStock}
                onClick={() => handlePurchase("buy")}
                className="flex h-12 items-center justify-center rounded-lg border border-black bg-white text-[13px] font-semibold uppercase tracking-[0.5px] text-black transition-colors hover:bg-[#f6f6f6] disabled:cursor-not-allowed disabled:border-[#d6d6d6] disabled:text-[#bdbdbd]"
              >
                Buy Now
              </button>
            </div>
          </div>

          <OffersCard
            title={settings.offersTitle}
            offers={settings.offers}
            trustBadges={settings.trustBadges}
          />

          <ProductAccordion sections={accordionSections} />
        </div>

        {reviews && (
          <div className="min-w-0 lg:col-span-2">
            {reviews}
          </div>
        )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={gallery}
          index={lightboxIndex}
          product={product}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}

      {showGuide && <SizeGuideModal onClose={() => setShowGuide(false)} />}

      {/* Name & Number is a popup now, the same one the listing cards use. */}
      {nameIntent && (
        <QuickAddModal
          product={product}
          unitPrice={unitPrice}
          unitMrp={unitMrp}
          lockedSize={selectedSize}
          quantity={quantity}
          ctaLabel={nameIntent === "buy" ? "Buy Now" : "Add to Cart"}
          onAdded={nameIntent === "buy" ? goToCheckout : undefined}
          onClose={() => setNameIntent(null)}
        />
      )}
    </div>
  );
}
