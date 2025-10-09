"use client";

import Link from "next/link";
import { Product } from "@/types/Product";
import Image from "next/image";
import useSWR from "swr";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";


interface ProductCardProps {
  product: Product | { slug: string }; // Allow either full product or just slug
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch product: ${url}`);
  const data = await res.json();
  return data?.docs?.[0] || null;
};

export default function ProductCard({ product }: ProductCardProps) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");
  const { addToCart, cartCount, addToWishlist, removeFromWishlist, wishlist } = useCart();
const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Use SWR to fetch product if only slug is provided, otherwise use prop
  const { data: fetchedProduct, error } = useSWR<Product>(
    product && "slug" in product && !("id" in product)
      ? `${process.env.NEXT_PUBLIC_API_URL}/products?where[slug][equals]=${encodeURIComponent(
          product.slug
        )}&depth=2`
      : null,
    fetcher,
    {
      dedupingInterval: 3600000, // Cache for 1 hour
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
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

  // Image URL with fallback
  const imageUrl = displayProduct.images?.[0]?.image?.url
    ? displayProduct.images[0].image.url.startsWith("http")
      ? displayProduct.images[0].image.url
      : `${apiBase}${displayProduct.images[0].image.url}`
    : "/placeholder.png";

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

  if (error) return <div className="text-red-600 text-sm">Error loading product...</div>;
  if (!displayProduct) return <Skeleton />;

  // Handle Add to Cart
  const handleAddToCart = () => {
    addToCart(displayProduct);
    setDrawerOpen(true); // 👈 show drawer
    // Log after a slight delay to capture the updated state
    setTimeout(() => {
      console.log("Added to cart, updated cartCount:", cartCount);
    }, 0);
  };



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

  return (
   <>
    <div className="rounded-lg overflow-hidden transition-all bg-white shadow-sm hover:shadow-md">
      <Link href={`/products/${displayProduct.slug}`}>
        <div className="relative">
          {imageUrl && (
            <Image
              style={{ borderRadius: "8px" }}
              width={300}
              height={300}
              src={imageUrl}
              alt={displayProduct.images?.[0]?.image?.alt || displayProduct.name}
              className="w-full border-[0.5px] border-[#C7CBD4] object-cover"
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
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
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
          {/* Discount Badge (if applicable) */}
          {displayProduct.salePrice && displayProduct.regularPrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {Math.round(
                ((displayProduct.regularPrice - displayProduct.salePrice) /
                  displayProduct.regularPrice) *
                  100
              )}
              % OFF
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
        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart();
          }}
          className="mt-2 w-full border border-black text-black py-1 sm:py-2 text-xs sm:text-sm rounded hover:border-gray-800 flex items-center justify-center gap-1 sm:gap-2"
        >
          Add to Cart
          <svg
            width="18"
            height="18"
            viewBox="0 0 22 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.05486 0C0.81809 0 0.591015 0.0921874 0.423591 0.256282C0.256167 0.420376 0.162109 0.642936 0.162109 0.875C0.162109 1.10706 0.256167 1.32962 0.423591 1.49372C0.591015 1.65781 0.81809 1.75 1.05486 1.75H1.4941C1.68795 1.75033 1.87643 1.81249 2.03105 1.9271C2.18567 2.0417 2.29802 2.20252 2.35114 2.38525L5.18295 12.0977C5.34312 12.6459 5.681 13.128 6.14552 13.4712C6.61004 13.8144 7.17594 14 7.75765 14H15.9156C16.451 14.0001 16.9741 13.8429 17.4175 13.5488C17.8608 13.2546 18.204 12.837 18.4028 12.3498L21.0347 5.89925C21.1429 5.63382 21.1831 5.34646 21.1518 5.06228C21.1205 4.7781 21.0187 4.50575 20.8552 4.26905C20.6918 4.03235 20.4716 3.8385 20.2141 3.70443C19.9565 3.57037 19.6694 3.50018 19.3777 3.5H4.53303L4.06701 1.904C3.90726 1.35585 3.56978 0.873576 3.10559 0.530069C2.6414 0.186562 2.07574 0.000497644 1.4941 0H1.05486ZM8.19689 21C8.5486 21 8.89687 20.9321 9.22182 20.8002C9.54676 20.6683 9.84201 20.4749 10.0907 20.2312C10.3394 19.9874 10.5367 19.698 10.6713 19.3795C10.8059 19.0611 10.8751 18.7197 10.8751 18.375C10.8751 18.0303 10.8059 17.6889 10.6713 17.3705C10.5367 17.052 10.3394 16.7626 10.0907 16.5188C9.84201 16.2751 9.54676 16.0817 9.22182 15.9498C8.89687 15.8179 8.5486 15.75 8.19689 15.75C7.48657 15.75 6.80534 16.0266 6.30307 16.5188C5.8008 17.0111 5.51863 17.6788 5.51863 18.375C5.51863 19.0712 5.8008 19.7389 6.30307 20.2312C6.80534 20.7234 7.48657 21 8.19689 21ZM15.3389 21C15.6906 21 16.0389 20.9321 16.3638 20.8002C16.6888 20.6683 16.984 20.4749 17.2327 20.2312C17.4814 19.9874 17.6787 19.698 17.8133 19.3795C17.9479 19.0611 18.0172 18.7197 18.0172 18.375C18.0172 18.0303 17.9479 17.6889 17.8133 17.3705C17.6787 17.052 17.4814 16.7626 17.2327 16.5188C16.984 16.2751 16.6888 16.0817 16.3638 15.9498C16.0389 15.8179 15.6906 15.75 15.3389 15.75C14.6286 15.75 13.9474 16.0266 13.4451 16.5188C12.9428 17.0111 12.6607 17.6788 12.6607 18.375C12.6607 19.0712 12.9428 19.7389 13.4451 20.2312C13.9474 20.7234 14.6286 21 15.3389 21Z"
              fill="black"
            />
          </svg>
        </button>
      </div>
    </div>
    <CartDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
   </>
    
  );
}