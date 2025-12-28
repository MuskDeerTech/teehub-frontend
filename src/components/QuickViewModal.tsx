"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/Product";
import { useCart } from "@/context/CartContext";
import SizeChartModal from "@/components/SizeChartModal";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import { Navigation, Pagination } from "swiper/modules";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedChart, setSelectedChart] = useState<"men" | "women" | "kids">(
    "men"
  );

  if (!product || !isOpen) return null;

  const images = product.images?.map((img) => img.image.url) || [];

  const handleAddToCart = () => {
    const user = localStorage.getItem("user");

    if (!user) {
      toast.error("Please login first!");
      return;
    }

    const hasSizes =
      product.attributes?.some(
        (attr) =>
          attr.attribute.name.toLowerCase() === "sizes" ||
          attr.attribute.name.toLowerCase() === "size"
      ) ?? false;

    if (hasSizes && !selectedSize) {
      toast.warning("Please select a size before adding to cart!");
      return;
    }

    addToCart(product, quantity, selectedSize || undefined);
    toast.success("Added to cart successfully!");
    onClose();
  };

  // ✅ FIX: WordPress returns HTML string, just strip tags
  const descriptionText = product.description
    ? product.description.replace(/<[^>]*>/g, "").trim()
    : "No description available";

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />

      <div className="fixed top-0 right-0 w-full sm:w-[450px] h-full bg-white shadow-2xl z-[9999] transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center border-b px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-800">Quick View</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {images.length > 0 && (
              <Swiper spaceBetween={10} slidesPerView={2} className="mb-4">
                {images.map((src, i) => (
                  <SwiperSlide key={i}>
                    <Image
                      unoptimized
                      src={src}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="rounded-lg border border-gray-200 object-cover w-64 h-64"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-lg font-bold text-gray-800">
                ₹{product.regularPrice}
              </p>
              {product.salePrice && (
                <>
                  <p className="text-sm text-gray-500 line-through">
                    ₹{product.salePrice}
                  </p>
                  <span className="text-green-600 text-sm font-semibold">
                    {Math.round(
                      ((product.regularPrice - product.salePrice) /
                        product.regularPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {descriptionText}
            </p>

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
                className="text-gray-500 underline flex items-center gap-1 text-sm hover:text-orange-600"
              >
                Size chart
              </button>
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {product.attributes
                    .find(
                      (attr) =>
                        attr.attribute.name.toLowerCase() === "sizes" ||
                        attr.attribute.name.toLowerCase() === "size"
                    )
                    ?.values.map((val) => (
                      <button
                        key={val.id}
                        onClick={() => setSelectedSize(val.value)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          selectedSize === val.value
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {val.value}
                      </button>
                    )) || (
                    <p className="text-gray-500 text-sm">No sizes available.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <h4 className="text-sm font-semibold">Quantity:</h4>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity((q) => (q > 1 ? q - 1 : q))}
                  className="px-3 py-1 border-r text-gray-600"
                >
                  -
                </button>
                <span className="px-3">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1 border-l text-gray-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="border-t p-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900"
            >
              Add to Cart
            </button>
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="w-full text-center border border-black py-2 rounded-md hover:bg-gray-100"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {showSizeChart && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <SizeChartModal
            isOpen={showSizeChart}
            onClose={() => setShowSizeChart(false)}
            chartType={selectedChart}
          />
        </div>
      )}
    </>
  );
}