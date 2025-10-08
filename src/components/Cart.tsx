"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Product } from "@/types/Product";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * item.quantity, // Use item.price directly
    0
  );

  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: number) => {
    const productId = cartItems[index].slug; // Use item.slug directly
    updateQuantity(productId, newQuantity);
  };

  // Remove item from cart
  const handleRemoveItem = (index: number) => {
    const productId = cartItems[index].slug; // Use item.slug directly
    removeFromCart(productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Your cart is empty.{" "}
          <Link href="/" className="text-orange-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item, index) => {
              const imageUrl = item.image
                ? item.image.startsWith("http")
                  ? item.image
                  : `${apiBase}${item.image}`
                : "/placeholder.png"; // Use item.image directly
              const price = item.price || 0; // Use item.price directly
              const total = price * item.quantity;

              return (
                <div
                  key={item.slug}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
                >
                  <Image
                    width={100}
                    height={100}
                    src={imageUrl}
                    alt={item.name} // Use item.name directly
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-800">
                      {item.name} {item.variation ? `(${item.variation})` : ""}
                    </h3>
                    <p className="text-xs text-gray-500">Price: ₹{price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(index, item.quantity - 1)
                        }
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(index, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold mt-1">Total: ₹{total}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* Subtotal and Checkout */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">
                Subtotal
              </span>
              <span className="text-lg font-semibold text-gray-900">
                ₹{subtotal}
              </span>
            </div>
            <Link
              href="/checkout"
              className="w-full bg-orange-600 text-white py-3 rounded-lg text-center hover:bg-orange-700 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}