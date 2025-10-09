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
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * item.quantity,
    0
  );
  const discount = Math.round(subtotal * 0.45);
  const totalPayable = subtotal - discount;

  // Disable scrolling when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
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
              const price = item.price || 0;
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
                    <p className="text-gray-500 text-xs">Colour: Beige</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold text-gray-900">₹{price}</span>
                      <span className="line-through text-gray-400 text-xs">
                        ₹{Math.round(price / 0.55)}
                      </span>
                      <span className="text-green-600 text-xs">(45% OFF)</span>
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
                      <div className="border rounded px-2 py-1 text-xs flex items-center">
                        Size: M
                      </div>
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
        <div className="bg-green-100 text-green-700 text-center text-sm py-2 font-medium">
          Yay! Free Delivery On This Order!
        </div>

        {/* Order Summary */}
        <div className="p-4 border-t text-sm">
          <h3 className="font-semibold mb-2 text-gray-800">Order Summary</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total MRP (Incl. Of Taxes)</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount On MRP</span>
              <span>-₹{discount}</span>
            </div>
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
          {/* <div className="flex justify-center gap-3 mb-3">
            <Image src="/icons/visa.png" alt="Visa" width={40} height={20} />
            <Image src="/icons/rupay.png" alt="RuPay" width={40} height={20} />
            <Image src="/icons/gpay.png" alt="GPay" width={40} height={20} />
            <Image src="/icons/paytm.png" alt="Paytm" width={40} height={20} />
            <Image
              src="/icons/mastercard.png"
              alt="MasterCard"
              width={40}
              height={20}
            />
          </div> */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900 text-base">
                ₹{totalPayable}
              </p>
              <p className="text-xs text-gray-400 line-through">₹{subtotal}</p>
            </div>
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
