"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { Product } from "@/types/Product";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    removeFromWishlist(product.slug);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Your wishlist is empty.{" "}
          <Link href="/" className="text-orange-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlist.map((item: Product) => {
            // ✅ WordPress images are already full URLs
            const imageUrl = item.images?.[0]?.image?.url || "/placeholder.png";
            const price = item.salePrice || item.regularPrice || 0;

            return (
              <div
                key={item.slug}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
              >
                <Image
                  unoptimized
                  width={100}
                  height={100}
                  src={imageUrl}
                  alt={item.images?.[0]?.image?.alt || item.name}
                  className="w-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500">Price: ₹{price}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.slug)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}