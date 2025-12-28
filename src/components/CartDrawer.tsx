// Updated CartDrawer.tsx - WordPress compatible
"use client";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
// import Link from "next/link";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { cartItems, removeFromCart, updateQuantity, updateSize } = useCart();
  const router = useRouter();

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
  const totalPayable = subtotal;

  // Disable scrolling when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleProceedToBuy = () => {
    const user = localStorage.getItem("user");

    if (!user) {
      toast.error("Please login first!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }

    router.push("/checkout");
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-[9998] ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 right-0 w-full sm:w-[450px] h-full bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ${
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
              // ✅ WordPress images are full URLs, no need for apiBase
              const imageUrl = item.image?.startsWith("http")
                ? item.image
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
                    unoptimized
                    src={imageUrl}
                    alt={item.name}
                    width={80}
                    height={100}
                    className="rounded-md object-cover w-20 h-24"
                  />
                  <div className="flex-1 text-sm">
                    <h3 className="font-semibold">{item.name}</h3>

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
                        {item.salePrice && (
                          <span className="line-through text-gray-400 text-xs">
                            ₹{item.salePrice}
                          </span>
                        )}
                      </div>
                      {hasDiscount && (
                        <span className="text-green-600 text-xs">
                          ({discountPercent}% OFF)
                        </span>
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

        {/* Savings Banner */}
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
            <button
              onClick={handleProceedToBuy}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
            >
              PROCEED TO BUY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}