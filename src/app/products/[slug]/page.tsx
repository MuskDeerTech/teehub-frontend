// src/app/products/[slug]/page.tsx
"use client"; // make this page client-side because we handle state

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Suspense } from "react";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRef } from "react";
import api from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link"; // Ensure this is imported at top
import SwiperCore from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/zoom";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { Product } from "@/types/Product";

// Import Swiper styles

interface LexicalTextNode {
  text: string;
  detail: number;
  format: number;
  mode: string;
  style: string;
  type: string;
  version: number;
}

interface LexicalParagraphNode {
  children: LexicalTextNode[];
  direction: string | null;
  format: string;
  indent: number;
  type: string;
  version: number;
  textFormat: number;
  textStyle: string;
}

interface LexicalRootNode {
  root: {
    children: LexicalParagraphNode[];
    direction: string | null;
    format: string;
    indent: number;
    type: string;
    version: number;
  };
}

interface Variation {
  attributes: string[];
  sku: string;
  price: number;
  stock: number;
  image?: { url: string; alt?: string };
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice?: number;
  images: { image: { url: string; alt?: string } }[];
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// SWR fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  const data = await res.json();
  return data?.docs || [];
};

async function getFeaturedProducts(): Promise<Product[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?limit=8&sort=createdAt&order=-1&depth=2`,
    { next: { revalidate: 60 } } // cache for 60s
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.docs || [];
}

const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-12">
      {/* 1st Column: Images */}
      <div className="flex flex-col lg:flex-row gap-4 h-[450px] lg:h-[650px]">
        <div className="w-full lg:w-24 flex-shrink-0 order-2 lg:order-1">
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden h-[150px] lg:h-[600px]">
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 h-full">
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="w-full h-16 bg-gray-300 rounded-lg animate-pulse"
                  />
                ))}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[calc(100%-5rem)] relative overflow-hidden aspect-[4/5] order-1 lg:order-2">
          <div className="w-full h-full bg-gray-300 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* 2nd Column: Product Details */}
      <div className="space-y-6 h-[650px] lg:h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
            <div className="h-8 w-3/4 bg-gray-300 rounded animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <div className="h-10 w-20 bg-gray-300 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-300 rounded animate-pulse" />
          </div>

          {/* Coupons - Static Display */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <div className="h-4 w-1/4 bg-gray-300 rounded animate-pulse mb-1" />
              <div className="h-8 w-full bg-gray-100 border border-gray-300 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-1/4 bg-gray-300 rounded animate-pulse mb-1" />
              <div className="h-8 w-full bg-gray-100 border border-gray-300 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-6 w-16 bg-gray-300 rounded animate-pulse" />
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <div className="h-10 w-12 bg-gray-100 rounded-l animate-pulse" />
              <div className="h-10 w-16 bg-gray-50 rounded animate-pulse" />
              <div className="h-10 w-12 bg-gray-100 rounded-r animate-pulse" />
            </div>
          </div>

          {/* Choose Size - Button Format */}
          <div className="mb-6">
            <div className="h-6 w-20 bg-gray-300 rounded animate-pulse mb-3" />
            <div className="flex flex-wrap gap-2">
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="h-10 w-16 bg-gray-100 border border-gray-300 rounded-lg animate-pulse"
                  />
                ))}
            </div>
          </div>

          {/* Choose Color - Swatches */}
          <div className="mb-6">
            <div className="h-6 w-20 bg-gray-300 rounded animate-pulse mb-3" />
            <div className="flex gap-2">
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="h-10 w-10 bg-gray-100 border border-gray-300 rounded-full animate-pulse"
                  />
                ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="h-12 w-full bg-gray-300 rounded-lg animate-pulse mb-6" />

          {/* Shipping Info */}
          <div className="h-10 w-full bg-blue-50 border border-blue-200 rounded-lg animate-pulse mb-6" />

          {/* Icons: Return & Exchange, Cash on Delivery, etc. */}
          <div className="grid grid-cols-4 gap-4 text-center mb-6">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
                </div>
              ))}
          </div>

          {/* Key Highlights */}
          <div className="bg-white p-6 border-[0.5px] border-[#C7CBD4] rounded-lg mb-6">
            <div className="h-8 w-1/2 bg-gray-300 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col space-y-1 border-b border-gray-100 pb-2 last:border-b-0"
                  >
                    <div className="h-4 w-1/3 bg-gray-300 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-gray-300 rounded animate-pulse" />
                  </div>
                ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div className="bg-white border-[0.5px] border-[#C7CBD4] rounded-lg">
              <div className="p-4 flex items-center justify-between">
                <div className="h-6 w-1/3 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
              </div>
              <div className="p-4 pt-4 h-16 bg-gray-200 border-t border-gray-200 animate-pulse" />
            </div>
            <div className="bg-white border-[0.5px] border-[#C7CBD4] rounded-lg">
              <div className="p-4 flex items-center justify-between">
                <div className="h-6 w-1/3 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
              </div>
              <div className="p-4 pt-4 h-16 bg-gray-200 border-t border-gray-200 animate-pulse" />
            </div>
            <div className="border-[0.5px] border-[#C7CBD4] rounded-lg">
              <div className="p-4 flex items-center justify-between">
                <div className="h-6 w-1/3 bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
              </div>
              <div className="p-4 pt-4 h-16 bg-gray-200 border-t border-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    {Array(8)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className="rounded-lg overflow-hidden bg-white animate-pulse"
        >
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

export default function ProductPage({ params }: ProductPageProps) {
  // Fetch featured products with SWR
  const { data: featuredProductsData, error: featuredProductsError } = useSWR<
    Product[]
  >(
    `${process.env.NEXT_PUBLIC_API_URL}/products?limit=8&sort=createdAt&order=-1&depth=2`,
    fetcher,
    {
      dedupingInterval: 3600000, // Cache for 1 hour
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const featuredProducts = featuredProductsData || [];
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useCart();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { slug } = React.use(params);
  const mainSwiperRef = useRef<SwiperCore | null>(null);
  const [mainImage, setMainImage] = useState<string>("/placeholder.png");
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    null
  );
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [coupon1, setCoupon1] = useState("");
  const [coupon2, setCoupon2] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");

  // Color map for swatches
  const colorMap: Record<string, string> = {
    White: "#FFFFFF",
    Black: "#000000",
    Blue: "#007BFF",
    Gray: "#6C757D",
    Purple: "#6F42C1",
    Orange: "#FD7E14",
    Beige: "#F5F5DC",
    // Add more as needed
  };

  // Fetch product with SWR
  const { data: productData, error: productError } = useSWR<Product[]>(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/products?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`,
    fetcher,
    {
      dedupingInterval: 3600000, // Cache for 1 hour
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Fetch related products with SWR
  const { data: relatedProductsData, error: relatedProductsError } = useSWR<
    RelatedProduct[]
  >(
    productData?.[0]?.categories && productData[0].categories.length > 0
      ? `${process.env.NEXT_PUBLIC_API_URL}/products?where[categories][in]=${productData[0].categories[0].id}&limit=3&depth=1`
      : null,
    fetcher,
    {
      dedupingInterval: 3600000, // Cache for 1 hour
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const product = productData?.[0] || null;
  const relatedProducts =
    relatedProductsData?.filter((r) => r.id !== product?.id).slice(0, 3) || [];

  // Wishlist state and effect
  const [isInWishlist, setIsInWishlist] = useState(
    product ? wishlist.some((item) => item.slug === product.slug) : false
  );

  // Sync local wishlist state with global state only when product is available
  useEffect(() => {
    if (product) {
      setIsInWishlist(wishlist.some((item) => item.slug === product.slug));
    }
  }, [wishlist, product]);

  // Set initial state when product data is available
  useEffect(() => {
    if (product) {
      const firstImage = product.images?.[0]?.image?.url
        ? product.images[0].image.url.startsWith("http")
          ? product.images[0].image.url
          : `${apiBase}${product.images[0].image.url}`
        : "/placeholder.png";
      setMainImage(firstImage);
      if (product.variations && product.variations.length > 0) {
        setSelectedVariation(product.variations[0]);
      }
    }
  }, [product]);

  // Handle attribute selection for variations
  useEffect(() => {
    if (!product?.variations) return;

    const matchingVariation = product.variations.find((varn) => {
      return varn.attributes.every((attrVal: string, idx: number) => {
        const attrName =
          product.attributes?.[idx]?.attribute.name.toLowerCase() || "";
        return selectedAttributes[attrName] === attrVal;
      });
    });

    if (matchingVariation) {
      setSelectedVariation(matchingVariation);
      if (matchingVariation.image?.url) {
        const varImage = matchingVariation.image.url.startsWith("http")
          ? matchingVariation.image.url
          : `${apiBase}${matchingVariation.image.url}`;
        setMainImage(varImage);
      }
    }
  }, [selectedAttributes, product]);

  if (productError || relatedProductsError) {
    console.error("Error fetching data:", productError || relatedProductsError);
    return <div>Error loading product...</div>;
  }

  if (!product) return <ProductDetailSkeleton />;

  const descriptionText =
    typeof product.description === "object" &&
    product.description?.root?.children?.[0]?.children?.[0]?.text
      ? product.description.root.children[0].children[0].text
      : "No description available";

  const thumbnailImages = product.images || [];
  const attributes = product.attributes || [];
  const variations = product.variations || [];
  const currentPrice = selectedVariation?.price || product.regularPrice || 0;
  const currentStock = selectedVariation?.stock || product.stockQuantity || 0;
  const hasSale =
    !!product.salePrice && currentPrice < (product.regularPrice || 0);
  const discountPercent = hasSale
    ? Math.round(
        ((product.regularPrice! - currentPrice) / product.regularPrice!) * 100
      )
    : 0;

  const handleAttributeSelect = (attrName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName.toLowerCase()]: value,
    }));
  };

  const handleSizeSelect = (value: string) => {
    setSelectedSize(value);
  };

  const colorAttribute = attributes.find(
    (attr) => attr.attribute.name.toLowerCase() === "colors"
  );
  const sizeAttribute = attributes.find(
    (attr) => attr.attribute.name.toLowerCase() === "sizes"
  );

  const incrementQuantity = () =>
    setQuantity((prev) => Math.min(prev + 1, currentStock));
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={i < rating ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.warning("Please select a size before adding to cart!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "colored",
      });
      return; // stop here — don’t add to cart
    }

    if (!product) return;

    addToCart(product);
    toast.success("Added to cart successfully!", {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      theme: "colored",
    });
    setDrawerOpen(true); // 👈 show drawer
  };

  return (
    <>
      <main className="px-4 py-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 mb-12">
          {/* 1st Column: Images */}
          <div className="flex flex-col lg:flex-row gap-4 h-[450px] lg:h-[650px] ">
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
                  const thumbUrl = img.image.url.startsWith("http")
                    ? img.image.url
                    : `${apiBase}${img.image.url}`;
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
                className="w-full "
                onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                onSlideChange={(swiper) => {
                  const activeIndex = swiper.activeIndex;
                  const activeImage = thumbnailImages[activeIndex]?.image?.url;
                  if (activeImage) {
                    const imgUrl = activeImage.startsWith("http")
                      ? activeImage
                      : `${apiBase}${activeImage}`;
                    setMainImage(imgUrl);
                  }
                }}
              >
                {thumbnailImages.map((img, idx) => {
                  const imgUrl = img.image.url.startsWith("http")
                    ? img.image.url
                    : `${apiBase}${img.image.url}`;
                  return (
                    <SwiperSlide key={idx}>
                      <div className="swiper-zoom-container">
                        <Image
                          width={600}
                          height={600}
                          src={imgUrl}
                          alt={img.image.alt || product.name}
                          className="w-full rounded-lg  object-cover border-[0.5px] border-[#C7CBD4]"
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              {/* Wishlist Icon - Moved to right end */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isInWishlist) {
                    removeFromWishlist(product.slug);
                    setIsInWishlist(false);
                    console.log("Removed from wishlist:", product.name);
                  } else {
                    addToWishlist(product);
                    setIsInWishlist(true);
                    console.log("Added to wishlist:", product.name);
                  }
                }}
                className="absolute top-4 right-4 cursor-pointer z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none"
                aria-label={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 32 28"
                  fill={isInWishlist ? "red" : "none"} // Black fill when in wishlist
                  stroke={isInWishlist ? "red" : "gray"}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.43734 1.33399C5.00765 1.33399 1.4165 4.92513 1.4165 9.35482C1.4165 17.3757 10.8957 24.6673 15.9998 26.3634C21.104 24.6673 30.5832 17.3757 30.5832 9.35482C30.5832 4.92513 26.992 1.33399 22.5623 1.33399C19.8498 1.33399 17.4509 2.68076 15.9998 4.74211C15.2601 3.68875 14.2775 2.82907 13.1352 2.23584C11.9929 1.6426 10.7245 1.33326 9.43734 1.33399Z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
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
            <div className="">
              <div className="flex flex-col lg:flex-row  lg:items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="flex items-center gap-1">
                  <Stars rating={4.7} />
                  <span className="text-sm text-gray-500">(4,712)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{currentPrice}
                </span>
                {hasSale && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.regularPrice}
                  </span>
                )}
              </div>

              {/* Coupons - Static Display */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Coupon Name 1/2
                  </label>
                  <div className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    WELCOME10
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Coupon Name 2/2
                  </label>
                  <div className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    SAVE20
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-semibold text-gray-700">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    className="px-4 py-3 hover:bg-gray-100 transition text-gray-600 font-medium"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-3 bg-gray-50 text-lg font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="px-4 py-3 hover:bg-gray-100 transition text-gray-600 font-medium"
                    disabled={quantity >= currentStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Choose Size - Button Format */}
              {sizeAttribute && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose Size
                  </label>
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
              )}

              {/* Choose Color - Swatches */}
              {colorAttribute && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose Color
                  </label>
                  <div className="flex gap-2">
                    {colorAttribute.values.map((val) => {
                      const isSelected =
                        selectedAttributes["colors"] === val.value;
                      const colorCode =
                        colorMap[val.value as keyof typeof colorMap] ||
                        "#CCCCCC";
                      return (
                        <button
                          key={val.id}
                          className={`w-10 h-10 rounded-full border-2 transition-all shadow-md hover:shadow-lg ${
                            isSelected
                              ? "border-orange-500 scale-110"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: colorCode }}
                          onClick={() =>
                            handleAttributeSelect("Colors", val.value)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                 onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
                className="w-full bg-orange-500 text-white py-2 rounded-lg mb-6 flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:bg-orange-600 transition transform "
              >
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                ADD TO CART
              </button>

              {/* Shipping Info */}
              <div className="text-sm text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                Arrives Wed, Oct 8 with standard shipping
              </div>

              {/* Icons: Return & Exchange, Cash on Delivery, etc. */}
              <div className="grid grid-cols-4 gap-4 text-center mb-6">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-10 h-10"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="25"
                      cy="25"
                      r="25"
                      fill="#FF7E38"
                      fill-opacity="0.5"
                    />
                    <path
                      d="M32.083 36.3327C32.8345 36.3327 33.5551 36.0342 34.0865 35.5028C34.6178 34.9715 34.9163 34.2508 34.9163 33.4993C34.9163 32.7479 34.6178 32.0272 34.0865 31.4959C33.5551 30.9645 32.8345 30.666 32.083 30.666C31.3316 30.666 30.6109 30.9645 30.0795 31.4959C29.5482 32.0272 29.2497 32.7479 29.2497 33.4993C29.2497 34.2508 29.5482 34.9715 30.0795 35.5028C30.6109 36.0342 31.3316 36.3327 32.083 36.3327ZM17.9163 36.3327C18.6678 36.3327 19.3885 36.0342 19.9198 35.5028C20.4512 34.9715 20.7497 34.2508 20.7497 33.4993C20.7497 32.7479 20.4512 32.0272 19.9198 31.4959C19.3885 30.9645 18.6678 30.666 17.9163 30.666C17.1649 30.666 16.4442 30.9645 15.9129 31.4959C15.3815 32.0272 15.083 32.7479 15.083 33.4993C15.083 34.2508 15.3815 34.9715 15.9129 35.5028C16.4442 36.0342 17.1649 36.3327 17.9163 36.3327Z"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M34.9163 23.5827H39.1663M39.1663 23.5827V26.416C39.1663 29.7551 39.1663 31.4239 38.1293 32.4623C37.4394 33.1523 36.4704 33.3832 34.9163 33.4597M39.1663 23.5827L37.3587 20.2252C36.3812 18.409 35.8924 17.5009 35.0523 17.0008C34.2137 16.4993 33.1838 16.4993 31.1211 16.4993H28.5413M15.083 33.4597C13.5289 33.3832 12.5613 33.1523 11.87 32.4623C10.833 31.4239 10.833 29.7551 10.833 26.416V20.7493C10.833 17.4103 10.833 15.74 11.87 14.703C12.907 13.666 14.5773 13.666 17.9163 13.666H22.5913C24.1738 13.666 24.9643 13.666 25.6046 13.8743C26.2424 14.0815 26.8221 14.4368 27.2963 14.911C27.7706 15.3852 28.1258 15.9649 28.3331 16.6028C28.5413 17.2431 28.5413 18.0336 28.5413 19.616C28.5413 21.3443 28.5413 22.2099 28.0682 22.795C27.9747 22.9102 27.8698 23.0151 27.7537 23.1095C27.1686 23.5827 26.3044 23.5827 24.5747 23.5827H19.333M29.2497 33.4994H20.7497"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M22.1663 26.4167C22.1663 26.4167 21.2143 25.629 20.3771 24.881C19.7863 24.405 19.333 23.9984 19.333 23.5904C19.333 23.2292 19.6872 22.8934 20.2623 22.3664C21.0783 21.6878 22.1663 20.75 22.1663 20.75"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span className="text-sm">Return & Exchange</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-10 h-10"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="25"
                      cy="25"
                      r="25"
                      fill="#FF7E38"
                      fill-opacity="0.5"
                    />
                    <path
                      d="M43.2083 16.6172H40.3704C39.5912 16.6076 39.0429 17.3194 39.1294 18.0698L28.5283 15.2223C27.1719 14.8568 25.7193 14.9433 24.4495 15.4724L20.6208 17.0597C18.5718 15.9246 16.3592 15.1357 13.8099 15.0395C13.5983 15.0203 13.3963 15.155 13.3097 15.3474L10.5969 21.3309C10.1063 21.5522 9.0481 21.5907 9 22.2641V36.5111C9 36.6842 9.08658 36.8478 9.23088 36.9536C9.37518 37.0498 9.56757 37.069 9.73111 37.0017C14.0985 35.2028 18.389 36.261 22.92 37.3672C27.6048 38.5313 32.4244 39.6375 37.0515 37.4538C37.2343 37.3672 37.3594 37.1845 37.3594 36.9728V27.4107L39.1294 26.6603V27.199C39.1294 27.8821 39.6778 28.44 40.3704 28.44H43.2083C43.8913 28.44 44.4492 27.8821 44.4492 27.199V17.8582C44.4396 17.1751 43.8913 16.6172 43.2083 16.6172ZM14.1178 16.117C19.3125 16.444 23.0931 19.9553 26.9988 22.9471C26.5178 22.8605 26.0368 22.7547 25.5462 22.6488C23.0642 20.7537 20.4861 18.8009 17.4078 17.4926C17.1384 17.3772 16.8306 17.5022 16.7151 17.762C16.3303 18.6085 15.2625 19.0991 14.1851 18.926C13.9446 18.8971 13.7137 19.0125 13.6175 19.2338L12.8864 20.8403C12.5594 20.8788 12.2323 20.9461 11.9052 20.9846L14.1178 16.117ZM22.9681 22.0332C20.0725 21.3213 17.1096 20.6383 14.1082 20.7441L14.4352 20.0226C15.6569 20.09 16.7921 19.5609 17.427 18.6662C19.4376 19.5705 21.2461 20.7634 22.9681 22.0332ZM36.2916 36.6361C27.7684 40.2724 18.7834 32.6054 10.0582 35.7415V22.6296C16.7921 20.1284 23.5164 24.0918 30.2695 24.4381C29.6442 24.4766 29.0189 24.5247 28.4418 24.7267C28.1916 24.8326 27.9319 24.871 27.6722 24.8037C22.968 23.9571 18.5525 22.418 13.6272 22.5238C13.3386 22.5334 13.1077 22.7643 13.1077 23.0529C13.1077 23.986 12.3381 24.871 11.2799 25.1596C11.049 25.227 10.8951 25.4386 10.8951 25.6791V31.7108C10.8855 32.0571 11.2414 32.3264 11.5685 32.2206C12.5497 31.9994 13.0692 32.6535 13.1077 33.5193C13.1077 33.6636 13.1654 33.7983 13.2712 33.8945C13.377 33.9907 13.5213 34.058 13.656 34.0484C16.8787 33.9522 20.0147 34.6833 23.0642 35.3759C25.9887 36.0493 29.0093 36.7323 32.155 36.7323C32.5783 36.7516 33.2421 36.7901 33.2517 36.1936C33.2517 35.2605 34.0213 34.3851 35.0795 34.0869C35.3103 34.0195 35.4643 33.8175 35.4643 33.577V28.2284L36.3012 27.8724V36.6361H36.2916ZM27.7106 22.1486L31.5971 23.3896C30.8179 23.4088 30.029 23.3703 29.2402 23.2934C28.7304 22.9278 28.2109 22.543 27.7106 22.1486ZM27.3259 27.8243C27.6241 28.0937 28.0185 28.2572 28.4321 28.2957C28.4321 28.2957 33.0593 28.6901 33.0689 28.6901C33.5114 28.7382 33.9636 28.6805 34.3965 28.6035V33.1922C33.2709 33.6444 32.4436 34.5967 32.232 35.6645C25.9598 35.6742 20.4092 32.9421 14.1082 32.971C13.9158 31.932 13.0019 31.0951 11.9437 31.1047V26.0639C13.0596 25.6214 13.8965 24.6594 14.1082 23.5916C18.6102 23.5724 22.7468 25.0153 27.095 25.7849C26.7102 26.4198 26.7198 27.2664 27.3259 27.8243ZM39.1294 25.5156C38.5715 25.7561 36.3878 26.6796 35.8779 26.9008C35.0217 27.2856 34.1271 27.7281 33.1555 27.6319L28.5187 27.2375C27.1816 26.997 28.2975 25.6502 29.144 25.631L31.6259 25.3616C32.5206 25.2462 34.2425 24.7267 34.2041 23.6686C34.156 23.3222 33.9347 23.024 33.5788 22.9182L27.4413 20.9654C26.9699 20.8115 26.4697 20.7537 25.9887 20.8211C25.6712 20.8595 24.4976 19.6667 24.209 19.455C23.4106 18.8682 22.6025 18.291 21.7656 17.7523L24.8632 16.4729C25.9021 16.04 27.1335 15.963 28.259 16.2613L39.1294 19.1953V25.5156ZM43.3814 27.2087C43.3814 27.3049 43.3045 27.3818 43.2083 27.3818H40.3704C40.2742 27.3818 40.1972 27.3049 40.1972 27.2087V18.772V17.8678C40.1972 17.7716 40.2742 17.6946 40.3704 17.6946H43.2083C43.3045 17.6946 43.3814 17.7716 43.3814 17.8678V27.2087Z"
                      fill="#231F20"
                    />
                    <path
                      d="M23.3049 26.5448C21.6311 26.0734 20.0438 27.2374 20.0727 28.9786C20.0727 30.6332 21.3713 32.2686 23.0356 32.7015C24.6517 33.1825 26.3256 32.0185 26.2679 30.2677C26.2679 28.6034 24.9692 26.968 23.3049 26.5448ZM24.6806 31.4605C22.7855 32.7303 19.9284 29.3538 21.6599 27.7857C23.5935 26.5063 26.4025 29.9021 24.6806 31.4605Z"
                      fill="#231F20"
                    />
                  </svg>

                  <span className="text-sm">Cash on Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-10 h-10"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="25"
                      cy="25"
                      r="25"
                      fill="#FF7E38"
                      fill-opacity="0.5"
                    />
                    <path
                      d="M33.0002 38.4008C34.5466 38.4008 35.8002 37.1472 35.8002 35.6008C35.8002 34.0544 34.5466 32.8008 33.0002 32.8008C31.4538 32.8008 30.2002 34.0544 30.2002 35.6008C30.2002 37.1472 31.4538 38.4008 33.0002 38.4008Z"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M19.0002 38.4008C20.5466 38.4008 21.8002 37.1472 21.8002 35.6008C21.8002 34.0544 20.5466 32.8008 19.0002 32.8008C17.4538 32.8008 16.2002 34.0544 16.2002 35.6008C16.2002 37.1472 17.4538 38.4008 19.0002 38.4008Z"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M16.2 35.5608C14.6642 35.4852 13.708 35.257 13.0248 34.5752C12.3416 33.8934 12.1148 32.9358 12.0392 31.4M21.8 35.6H30.2M35.8 35.5608C37.3358 35.4852 38.292 35.257 38.9752 34.5752C40 33.549 40 31.8998 40 28.6V25.8H33.42C32.377 25.8 31.8562 25.8 31.4348 25.6628C31.0146 25.5263 30.6327 25.2922 30.3202 24.9798C30.0078 24.6673 29.7737 24.2854 29.6372 23.8652C29.5 23.4438 29.5 22.923 29.5 21.88C29.5 20.3162 29.5 19.535 29.2942 18.9022C29.0894 18.2719 28.7383 17.699 28.2697 17.2303C27.801 16.7617 27.2281 16.4106 26.5978 16.2058C25.965 16 25.1838 16 23.62 16H12M12 21.6H20.4M12 25.8H17.6"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M29.5 18.8008H32.0494C34.0878 18.8008 35.1056 18.8008 35.9344 19.2964C36.7646 19.7906 37.2476 20.688 38.2136 22.4828L40 25.8008"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span className="text-sm">Delivery Charges</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-10 h-10"
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="25"
                      cy="25"
                      r="25"
                      fill="#FF7E38"
                      fill-opacity="0.5"
                    />
                    <path
                      d="M23.2852 38.9989C23.2852 38.9989 33.5699 35.5706 33.5699 27"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M33.5699 26.9989V16.7141C33.5699 16.7141 30.1417 15 23.2852 15"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M23.2848 38.9989C23.2848 38.9989 13 35.5706 13 27"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M13 26.9989V16.7141C13 16.7141 16.4283 15 23.2848 15"
                      stroke="black"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M30.1415 20.1426C23.285 25.285 21.5708 32.1415 21.5708 32.1415C21.5708 32.1415 19.8567 30.0955 18.1426 28.7132"
                      stroke="black"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span className="text-sm">Secure Payments</span>
                </div>
              </div>

              {/* Key Highlights */}
              <div className="bg-white p-6 border-[0.5px] border-[#C7CBD4] rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  Key Highlights
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {attributes.slice(0, 8).map((attr, idx) => (
                    <div
                      key={attr.attribute.id}
                      className="flex flex-col space-y-1 border-b border-gray-100 pb-2 last:border-b-0"
                    >
                      <span className="font-bold text-gray-700">
                        {attr.attribute.name}:
                      </span>
                      <span className="text-gray-600 ">
                        {attr.values?.[0]?.value || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                <details
                  open
                  className="bg-white border-[0.5px] border-[#C7CBD4] rounded-lg"
                >
                  <summary className="p-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                    <span>Product Description</span>
                    <svg
                      className="w-4 h-4 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="p-4 pt-4 text-sm text-gray-700 border-t border-gray-200">
                    {descriptionText}
                  </div>
                </details>

                <details className="bg-white border-[0.5px] border-[#C7CBD4] rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                    <span>Return & Exchange</span>
                    <svg
                      className="w-4 h-4 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="p-4 pt-4 text-sm text-gray-700 border-t border-gray-200">
                    Free return within 30 days. Learn more about return &
                    exchange policy.
                  </div>
                </details>

                <details className="border-[0.5px] border-[#C7CBD4] rounded-lg">
                  <summary className="p-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                    <span>Customer Reviews</span>
                    <svg
                      className="w-4 h-4 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="p-4 pt-4 text-sm text-gray-700 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Stars rating={4.7} />
                      <span>Based on 4,712 reviews</span>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Frequently Bought Together */}
          <div className="mt-16">
            <h2 className="text-2xl  text-center font-semibold mb-8 text-gray-900">
              Frequently Bought Together
            </h2>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">
                  Featured Products
                </h2>
                <Link
                  prefetch={true}
                  href="/products"
                  className="text-blue-600 hover:underline font-medium"
                >
                  View All →
                </Link>
              </div>
              <Suspense fallback={<ProductGridSkeleton />}>
                <ProductGrid products={featuredProducts} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      <ToastContainer />
    </>
  );
}

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    ))}
  </div>
);
