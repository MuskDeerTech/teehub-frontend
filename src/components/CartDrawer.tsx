// D:\teehub-frontend\src\components\CartDrawer.tsx
"use client";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { cartItems, removeFromCart, updateQuantity, updateSize } = useCart();
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.regularPrice || 0) * item.quantity,
    0
  );
  const originalTotal = cartItems.reduce(
    (total, item) => total + (item.regularPrice || item.price) * item.quantity,
    0
  );
  const savings = originalTotal - subtotal;
  // Remove hardcoded 45% discount; use savings from salePrice vs regularPrice
  const totalPayable = subtotal; // No additional hardcoded discount

  // Disable scrolling when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 backdrop-blur-sm ${
        isOpen ? "opacity-90 bg-black/90" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed right-0 top-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="font-semibold text-lg">My Bag ({cartItems.length})</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-600 hover:text-black"
          >
            ×
          </button>
        </div>
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Your bag is empty 🛍
            </p>
          ) : (
            cartItems.map((item) => {
              const imageUrl = item.image
                ? item.image.startsWith("http")
                  ? item.image
                  : `${apiBase}${item.image}`
                : "/placeholder.png";
              const price = item.regularPrice || 0;
              const hasDiscount =
                item.salePrice &&
                item.regularPrice &&
                item.salePrice < item.regularPrice;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((item.regularPrice! - item.salePrice!) /
                      item.regularPrice!) *
                      100
                  )
                : 0;

              return (
                <div
                  key={item.slug}
                  className="flex gap-3 border rounded-lg p-3"
                >
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    width={80}
                    height={100}
                    className="rounded-md object-cover w-20 h-24"
                  />
                  <div className="flex-1 text-sm">
                    <h3 className="font-semibold">{item.name}</h3>
                    {/* Display variation attributes if available */}
                    {/* Size Selector */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSize(item.slug, size)}
                          className={`px-3 py-1 border rounded-md text-xs transition-all ${
                            item.variation === size
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <div>
                        <span className="font-bold text-gray-900">
                          ₹{price}{" "}
                        </span>
                        <span className="line-through text-gray-400 text-xs">
                          {item.salePrice}
                        </span>
                      </div>
                      {hasDiscount && (
                        <>
                          <span className="line-through text-gray-400 text-xs">
                            ₹{item.regularPrice}
                          </span>
                          <span className="text-green-600 text-xs">
                            ({discountPercent}% OFF)
                          </span>
                        </>
                      )}
                    </div>
                    {/* Quantity and Size */}
                    <div className="flex gap-2 mt-2">
                      <div className="flex items-center border rounded px-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.slug, item.quantity - 1)
                          }
                          className="px-1 text-gray-600"
                        >
                          −
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.slug, item.quantity + 1)
                          }
                          className="px-1 text-gray-600"
                        >
                          +
                        </button>
                      </div>
                      {item.variation && (
                        <div className="border rounded px-2 py-1 text-xs flex items-center">
                          Size: {item.variation}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.slug)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>
        {/* Free Delivery */}
        {savings > 0 && (
          <div className="bg-green-100 text-green-700 text-center text-sm py-2 font-medium">
            Yay! You saved ₹{savings} on this order!
          </div>
        )}
        {/* Order Summary */}
        <div className="p-4 border-t text-sm">
          <h3 className="font-semibold mb-2 text-gray-800">Order Summary</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total MRP (Incl. Of Taxes)</span>
              <span>₹{originalTotal}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount on MRP</span>
                <span>-₹{savings}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Coupon Discount</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-green-600">FREE</span>
            </div>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total Payable</span>
            <span>₹{totalPayable}</span>
          </div>
        </div>
        {/* Payment Footer */}
        <div className="border-t p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900 text-base">
                ₹{totalPayable}
              </p>
              {savings > 0 && (
                <p className="text-xs text-gray-400 line-through">
                  ₹{originalTotal}
                </p>
              )}
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>You Saved</span>
                <span>₹{savings}</span>
              </div>
            )}
            <Link
              href="/checkout"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
            >
              PROCEED TO BUY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
