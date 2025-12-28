"use client";

import Link from "next/link";
import { Product } from "@/types/Product";
import Image from "next/image";
import useSWR from "swr";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import QuickViewModal from "@/components/QuickViewModal";

interface ProductCardProps {
  product: Product | { slug: string };
}

// API route fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch product: ${url}`);
  const data = await res.json();
  
  // API returns array, get first item
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  return null;
};

export default function ProductCard({ product }: ProductCardProps) {
  // const { addToCart, cartCount, addToWishlist, removeFromWishlist, wishlist } =
  //   useCart();
  const { addToWishlist, removeFromWishlist, wishlist } = useCart();

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isQuickViewOpen, setQuickViewOpen] = useState(false);

  // Fetch product if only slug is provided
  const { data: fetchedProduct, error } = useSWR<Product | null>(
    product && "slug" in product && !("id" in product)
      ? `/api/products?slug=${encodeURIComponent(product.slug)}`
      : null,
    fetcher,
    {
      dedupingInterval: 3600000,
      revalidateOnFocus: false,
    }
  );

  const displayProduct = fetchedProduct || (product as Product);

  // Sync local isInWishlist with global wishlist state
  const [isInWishlist, setIsInWishlist] = useState(
    wishlist.some((item) => item.slug === displayProduct.slug)
  );

  // Update local state when wishlist changes
  useEffect(() => {
    setIsInWishlist(wishlist.some((item) => item.slug === displayProduct.slug));
  }, [wishlist, displayProduct.slug]);

  // Image URL
  const imageUrl =
    displayProduct?.images?.[0]?.image?.url || "/placeholder.png";

  const Skeleton = () => (
    <div className="rounded-lg overflow-hidden bg-white animate-pulse shadow-sm">
      <div className="w-full h-48 sm:h-64 bg-gray-300" />
      <div className="p-2 sm:p-3">
        <div className="h-4 sm:h-6 w-3/4 bg-gray-300 mt-1 sm:mt-2" />
        <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
          <div className="h-3 sm:h-5 w-12 sm:w-16 bg-gray-300" />
          <div className="h-3 sm:h-5 w-8 sm:w-12 bg-gray-300" />
        </div>
      </div>
    </div>
  );

  if (error) {
    console.error("ProductCard error:", error);
    return <div className="text-red-600 text-sm">Error loading product...</div>;
  }
  if (!displayProduct) return <Skeleton />;

  // Handle Add to Cart
  // const handleAddToCart = () => {
  //   addToCart(displayProduct);
  //   setDrawerOpen(true);
  //   setTimeout(() => {
  //     console.log("Added to cart, updated cartCount:", cartCount);
  //   }, 0);
  // };

  // Handle Add/Remove from Wishlist
  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(displayProduct.slug);
      setIsInWishlist(false);
      console.log("Removed from wishlist:", displayProduct.name);
    } else {
      addToWishlist(displayProduct);
      setIsInWishlist(true);
      console.log("Added to wishlist:", displayProduct.name);
    }
  };

  // Calculate discount percentage
  const discountPercent =
    displayProduct.salePrice && displayProduct.regularPrice
      ? Math.round(
          ((displayProduct.regularPrice - displayProduct.salePrice) /
            displayProduct.regularPrice) *
            100
        )
      : 0;

  return (
    <>
      <div className="rounded-lg overflow-hidden transition-all bg-white shadow-sm hover:shadow-md">
        <Link href={`/products/${displayProduct.slug}`}>
          <div className="relative">
            {imageUrl && (
              <Image
                unoptimized
                width={300}
                height={300}
                src={imageUrl}
                alt={displayProduct.name}
                className="w-full border-[0.5px] border-[#C7CBD4] object-cover rounded-lg"
              />
            )}
            {/* Wishlist Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlistToggle();
              }}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none"
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isInWishlist ? "red" : "none"}
                stroke={isInWishlist ? "red" : "gray"}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 000-7.78z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {discountPercent}% OFF
              </div>
            )}
          </div>
        </Link>
        <div className="p-2 sm:p-3">
          {/* Price and Discount Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                ₹{displayProduct.regularPrice || 0}
              </p>
              {displayProduct.salePrice && (
                <p className="text-xs sm:text-sm line-through text-gray-500">
                  ₹{displayProduct.salePrice}
                </p>
              )}
            </div>
          </div>
          {/* Product Name */}
          <h2
            className="text-sm sm:text-base font-medium text-gray-800 mb-2 whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ maxWidth: "100%" }}
          >
            {displayProduct.name}
          </h2>
          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            className="mt-2 w-full border border-black text-black font-bold py-1 sm:py-2 text-xs sm:text-sm rounded hover:border-gray-800 flex items-center justify-center gap-1 sm:gap-2"
          >
            Quick View
          </button>
        </div>
      </div>
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      <QuickViewModal
        product={displayProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}