"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/cart/CartContext";
import type { Product } from "@/lib/products";
import SizeGuideModal from "@/components/ui/SizeGuideModal";

const fallbackSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

// Client-only mount flag without a setState-in-effect (see ProductDetails).
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Quick-add popup for the home/listing cards. Opened by the card's ＋ when a
 * product allows a custom name (jerseys): the customer picks a size and enters
 * a Name & Number before the item lands in the cart. Adding closes this popup
 * and opens the cart drawer (addItem flips `cartOpen`).
 */
export default function QuickAddModal({
  product,
  unitPrice,
  unitMrp,
  onClose,
}: {
  product: Product;
  unitPrice: number;
  unitMrp: number;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const sizes = product.detailSizes?.length ? product.detailSizes : fallbackSizes;
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [nameValue, setNameValue] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleAdd() {
    const customName = nameValue.trim();
    const customNumber = numberValue.trim();

    if (!customName || !customNumber) {
      setShowValidation(true);
      return;
    }

    addItem({
      id: product.slug,
      name: product.title,
      image: product.image ?? "",
      size: selectedSize,
      quantity: 1,
      price: unitPrice,
      mrp: unitMrp,
      customName: `${customName} ${customNumber}`,
    });
    onClose();
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Add ${product.title} to cart`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-gray-100 p-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#fafafa]">
            {product.image && (
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-black">
              {product.title}
            </h2>
            <p className="mt-1 text-sm font-bold text-[#f36d43]">
              ₹{unitPrice.toLocaleString("en-IN")}
              {unitMrp > unitPrice && (
                <span className="ml-2 text-xs font-medium text-gray-400 line-through">
                  ₹{unitMrp.toLocaleString("en-IN")}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none text-gray-500 transition-colors hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Size */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-black">Select Size</span>
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="text-xs font-medium text-blue-600 underline underline-offset-2"
            >
              Size Guide
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`min-h-[34px] rounded-full border px-2 text-xs transition ${
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : "border-[#d6d6d6] bg-white text-black hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Name & Number */}
          <div className="mt-4">
            <span className="text-sm font-medium text-black">
              Name & T-shirt Number
            </span>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="NAME"
                required
                aria-invalid={showValidation && !nameValue.trim()}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className={`h-10 min-w-0 flex-1 rounded-lg bg-white px-3 text-center text-sm uppercase text-black outline-none ring-1 focus:ring-black ${
                  showValidation && !nameValue.trim()
                    ? "ring-red-500"
                    : "ring-[#e5e5e5]"
                }`}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="07"
                required
                aria-invalid={showValidation && !numberValue.trim()}
                value={numberValue}
                onChange={(e) => setNumberValue(e.target.value)}
                className={`h-10 w-16 shrink-0 rounded-lg bg-white text-center text-sm text-black outline-none ring-1 focus:ring-black ${
                  showValidation && !numberValue.trim()
                    ? "ring-red-500"
                    : "ring-[#e5e5e5]"
                }`}
              />
            </div>
            {showValidation && (!nameValue.trim() || !numberValue.trim()) && (
              <p className="mt-2 text-xs text-red-600" role="alert">
                Name and T-shirt number are both required.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-5 w-full rounded-xl bg-[#f36d43] py-3 text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {showGuide && <SizeGuideModal onClose={() => setShowGuide(false)} />}
    </div>,
    document.body,
  );
}
