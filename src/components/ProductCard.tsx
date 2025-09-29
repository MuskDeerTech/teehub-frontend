"use client";
import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
 const imageUrl = product.images?.[0]?.image?.url
    ? product.images[0].image.url.startsWith('http')
      ? product.images[0].image.url
      : `${process.env.NEXT_PUBLIC_API_URL}${product.images[0].image.url.replace(/^\/api/, '')}`
    : "/placeholder.png";

  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-xl transition bg-white">
      <Link href={`/products/${product.slug}`}>
        <div className="relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-72 object-cover"
          />
          {/* Trending badge */}
          {product.badges?.length > 0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              {product.badges[0]}
            </span>
          )}
        </div>
        <div className="p-3">
          <h2 className="text-base font-medium text-gray-800 truncate">
            {product.name}
          </h2>
          <p className="text-gray-500 text-sm">SKU: {product.sku}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-lg font-semibold">₹{product.regularPrice}</p>
            {product.salePrice && (
              <>
                <p className="text-sm line-through text-gray-400">
                  ₹{product.salePrice}
                </p>
                <p className="text-green-600 text-sm">
                  {Math.round(
                    ((product.salePrice - product.regularPrice) /
                      product.salePrice) *
                      100
                  )}
                  % OFF
                </p>
              </>
            )}
          </div>
          <button className="mt-3 w-full bg-black text-white py-2 text-sm rounded hover:bg-gray-800">
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
}
