"use client";
import Link from "next/link";
import { Product } from "@/types/Product"; // import the interface
import Image from "next/image";
interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");

  const imageUrl = product.images?.[0]?.image?.url
    ? product.images[0].image.url.startsWith("http")
      ? product.images[0].image.url
      : `${apiBase}${product.images[0].image.url}`
    : "/placeholder.png";

  return (
    <div className="rounded-lg overflow-hidden transition bg-white">
      <Link href={`/products/${product.slug}`}>
        <div>
          <Image
            width={400}
            height={400}
            src={imageUrl}
            alt={product.images?.[0]?.image?.alt || product.name}
            className="w-full h-72 object-cover"
          />
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 mt-2">
            <p className="text-lg font-semibold">₹{product.regularPrice}</p>
            {product.salePrice && (
              <>
                <p className="text-sm line-through text-gray-400">
                  ₹{product.salePrice}
                </p>
                <p className="text-green-600 text-sm">
                  {Math.round(
                    ((product.regularPrice! - product.salePrice) /
                      product.regularPrice!) *
                      100
                  )}
                  % OFF
                </p>
              </>
            )}
          </div>
          <h2 className="text-base font-medium text-gray-800">
            {product.name}
          </h2>

          <button className="mt-3 w-full bg-black text-white py-2 text-sm rounded hover:bg-gray-800">
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
}
