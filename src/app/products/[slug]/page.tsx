// src/app/products/[slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRef } from "react";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import SwiperCore from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/zoom";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import SizeChartModal from "@/components/SizeChartModal";
import { Product } from "@/types/Product";

// ✅ FIXED: Fetcher for WordPress API
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  const data = await res.json();
  // WordPress API returns array directly, not { docs: [] }
  return Array.isArray(data) ? data : [];
};

const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-12">
      {/* Image skeleton */}
      <div className="flex flex-col lg:flex-row gap-4 h-[450px] lg:h-[650px]">
        <div className="w-full lg:w-24 flex-shrink-0 order-2 lg:order-1">
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden h-[150px] lg:h-[600px]">
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 h-full">
              {Array(4).fill(null).map((_, index) => (
                <div key={index} className="w-full h-16 bg-gray-300 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[calc(100%-5rem)] relative overflow-hidden aspect-[4/5] order-1 lg:order-2">
          <div className="w-full h-full bg-gray-300 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Details skeleton */}
      <div className="space-y-6 h-[650px] lg:h-[650px] overflow-y-auto">
        <div className="p-6">
          <div className="h-8 w-3/4 bg-gray-300 rounded animate-pulse mb-4" />
          <div className="h-10 w-20 bg-gray-300 rounded animate-pulse mb-6" />
          <div className="h-12 w-full bg-gray-300 rounded-lg animate-pulse mb-6" />
        </div>
      </div>
    </div>
  </div>
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    {Array(8).fill(null).map((_, index) => (
      <div key={index} className="rounded-lg overflow-hidden bg-white animate-pulse">
        <div className="w-full h-64 bg-gray-300" />
        <div className="p-3">
          <div className="h-6 w-3/4 bg-gray-300 mt-2" />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-5 w-16 bg-gray-300" />
            <div className="h-5 w-12 bg-gray-300" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function ProductPage() {
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedChart, setSelectedChart] = useState<"men" | "women" | "kids">("men");
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [mainImage, setMainImage] = useState<string>("/placeholder.png");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isInWishlist, setIsInWishlist] = useState(false);

  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const mainSwiperRef = useRef<SwiperCore | null>(null);

  // ✅ FIXED: Fetch from WordPress API route
  const {
    data: productData,
    error: productError,
  } = useSWR<Product[]>(
    slug ? `/api/products?slug=${encodeURIComponent(slug)}` : null,
    fetcher,
    {
      dedupingInterval: 3600000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );
  const product = productData?.[0] || null;

  // ✅ FIXED: Fetch all products for "Featured Products" section
  const { data: featuredProducts } = useSWR<Product[]>(
    `/api/products`,
    fetcher,
    {
      dedupingInterval: 3600000,
      revalidateOnFocus: false,
    }
  );

  // Wishlist state
  useEffect(() => {
    if (product) {
      setIsInWishlist(wishlist.some((item) => item.slug === product.slug));
    }
  }, [wishlist, product]);

  // Initialize main image
  useEffect(() => {
    if (product && product.images?.[0]?.image?.url) {
      setMainImage(product.images[0].image.url);
    }
  }, [product]);

  // Early return for loading/error
  if (productError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Error loading product</h2>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    );
  }

  if (!product) return <ProductDetailSkeleton />;

  // Product data
  const thumbnailImages = product.images || [];
  const currentPrice = product.salePrice || product.regularPrice || 0;
  const hasSale = !!product.salePrice && product.salePrice < (product.regularPrice || 0);
  const discountPercent = hasSale
    ? Math.round(((product.regularPrice! - currentPrice) / product.regularPrice!) * 100)
    : 0;

  // Get size attribute
  const sizeAttribute = product.attributes?.find(
    (attr) => attr.attribute.name.toLowerCase() === "sizes" || attr.attribute.name.toLowerCase() === "size"
  );

  // Handlers
  const incrementQuantity = () => setQuantity((p) => p + 1);
  const decrementQuantity = () => setQuantity((p) => Math.max(p - 1, 1));
  const handleSizeSelect = (value: string) => setSelectedSize(value);

  const handleAddToCart = () => {
    if (sizeAttribute && !selectedSize) {
      toast.warning("Please select a size before adding to cart!", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }

    addToCart(product, quantity, selectedSize || undefined);
    toast.success("Added to cart successfully!", {
      position: "top-center",
      autoClose: 1500,
      theme: "colored",
    });
    setDrawerOpen(true);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product.slug);
      setIsInWishlist(false);
    } else {
      addToWishlist(product);
      setIsInWishlist(true);
    }
  };

  // Extract description
  const descriptionText =
    typeof product.description === "string"
      ? product.description.replace(/<[^>]*>/g, "")
      : "No description available";

  return (
    <>
      <main className="px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 mb-12">
          {/* 1st Column: Images */}
          <div className="flex flex-col lg:flex-row gap-4 h-[450px] lg:h-[650px]">
            {/* Vertical Thumbnails */}
            <div className="w-full lg:w-24 flex-shrink-0 order-2 lg:order-1">
              <Swiper
                direction="vertical"
                slidesPerView={4}
                spaceBetween={8}
                className="h-[150px] lg:h-[600px] w-full lg:w-24"
                breakpoints={{
                  0: {
                    direction: "horizontal",
                    slidesPerView: 4,
                    spaceBetween: 4,
                  },
                  1024: {
                    direction: "vertical",
                    slidesPerView: 4,
                    spaceBetween: 8,
                  },
                }}
              >
                {thumbnailImages.map((img, idx) => {
                  const thumbUrl = img.image.url;
                  const isActive = thumbUrl === mainImage;
                  return (
                    <SwiperSlide key={idx}>
                      <div
                        className={`relative cursor-pointer rounded-lg overflow-hidden transition-all shadow-sm ${
                          isActive
                            ? "border-2 border-orange-700 p-0.5"
                            : "hover:shadow-md hover:scale-105"
                        }`}
                        onClick={() => {
                          setMainImage(thumbUrl);
                          if (mainSwiperRef.current) {
                            mainSwiperRef.current.slideTo(idx, 300);
                          }
                        }}
                      >
                        <Image
                          unoptimized
                          width={100}
                          height={100}
                          src={thumbUrl}
                          alt={img.image.alt || product.name}
                          className="w-full object-cover rounded-lg border-[0.5px] border-[#C7CBD4]"
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>

            {/* Main Image */}
            <div className="w-full lg:w-[calc(100%-5rem)] relative overflow-hidden aspect-[4/5] order-1 lg:order-2">
              <Swiper
                zoom={true}
                modules={[Zoom]}
                className="w-full"
                onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                onSlideChange={(swiper) => {
                  const activeIndex = swiper.activeIndex;
                  const activeImage = thumbnailImages[activeIndex]?.image?.url;
                  if (activeImage) {
                    setMainImage(activeImage);
                  }
                }}
              >
                {thumbnailImages.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="swiper-zoom-container">
                      <Image
                        unoptimized
                        width={600}
                        height={600}
                        src={img.image.url}
                        alt={img.image.alt || product.name}
                        className="w-full rounded-lg object-cover border-[0.5px] border-[#C7CBD4]"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Wishlist Icon */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 cursor-pointer z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 32 28"
                  fill={isInWishlist ? "red" : "none"}
                  stroke={isInWishlist ? "red" : "gray"}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.43734 1.33399C5.00765 1.33399 1.4165 4.92513 1.4165 9.35482C1.4165 17.3757 10.8957 24.6673 15.9998 26.3634C21.104 24.6673 30.5832 17.3757 30.5832 9.35482C30.5832 4.92513 26.992 1.33399 22.5623 1.33399C19.8498 1.33399 17.4509 2.68076 15.9998 4.74211C15.2601 3.68875 14.2775 2.82907 13.1352 2.23584C11.9929 1.6426 10.7245 1.33326 9.43734 1.33399Z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {hasSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {discountPercent}% OFF
                </div>
              )}
            </div>
          </div>

          {/* 2nd Column: Product Details */}
          <div className="space-y-6 h-[650px] lg:h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{currentPrice}</span>
                {hasSale && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.regularPrice}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-semibold text-gray-700">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    className="px-4 py-3 hover:bg-gray-100 transition text-gray-600 font-medium"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-3 bg-gray-50 text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="px-4 py-3 hover:bg-gray-100 transition text-gray-600 font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Size Selection */}
              {sizeAttribute && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Select Size
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const category =
                          product.categories?.[0]?.name?.toLowerCase() || "men";
                        if (category.includes("women")) setSelectedChart("women");
                        else if (category.includes("kid")) setSelectedChart("kids");
                        else setSelectedChart("men");
                        setShowSizeChart(true);
                      }}
                      className="text-gray-500 underline text-sm hover:text-orange-600"
                    >
                      Size chart
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {sizeAttribute.values.map((val) => {
                        const isSelected = selectedSize === val.value;
                        return (
                          <button
                            key={val.id}
                            className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                              isSelected
                                ? "border-orange-500 bg-orange-50 text-orange-600 font-medium"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => handleSizeSelect(val.value)}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 text-white py-3 rounded-lg mb-6 flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:bg-orange-600 transition"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                ADD TO CART
              </button>

              {/* Product Description */}
              <details open className="bg-white border-[0.5px] border-[#C7CBD4] rounded-lg mb-4">
                <summary className="p-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                  <span>Product Description</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-4 text-sm text-gray-700 border-t border-gray-200">
                  {descriptionText}
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={featuredProducts?.slice(0, 8) || []} />
          </Suspense>
        </div>
      </main>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      <SizeChartModal
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        chartType={selectedChart}
      />
      <ToastContainer />
    </>
  );
}