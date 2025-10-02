// src/app/products/[slug]/page.tsx
"use client"; // make this page client-side because we handle state

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";

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

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: LexicalRootNode;
  regularPrice?: number;
  salePrice?: number;
  mrp?: number;
  images?: { image: { url: string; alt?: string } }[];
  categories?: { name: string; id: string }[];
  brand?: string;
  stockStatus?: string;
  attributes?: {
    attribute: { name: string; id: string };
    values: { value: string; id: string }[];
  }[];
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");

    const res = await fetch(
      `${baseUrl}/products?where[slug][equals]=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data?.docs?.[0] || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params); // <-- unwrap the promise here

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");

  // Fetch product on mount
  useEffect(() => {
    async function fetchProduct() {
      const prod = await getProduct(slug); // <-- now slug is normal string
      if (!prod) return notFound();
      setProduct(prod);

      const firstImage = prod.images?.[0]?.image?.url
        ? prod.images[0].image.url.startsWith("http")
          ? prod.images[0].image.url
          : `${apiBase}${prod.images[0].image.url}`
        : "/placeholder.png";

      setMainImage(firstImage);
    }

    fetchProduct();
  }, [slug]); // <-- use slug instead of params.slug

  if (!product) return <div>Loading...</div>;

  const descriptionText =
    typeof product.description === "object" &&
    product.description?.root?.children?.[0]?.children?.[0]?.text
      ? product.description.root.children[0].children[0].text
      : "No description available";

  const thumbnailImages = product.images?.slice(1) || [];
  const attributes = product.attributes || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="relative w-full h-[500px] border rounded-lg overflow-hidden shadow-md">
            <Image
              width={800}
              height={800}
              src={mainImage}
              alt={product.images?.[0]?.image?.alt || product.name}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Thumbnail Images */}
          {thumbnailImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {thumbnailImages.map((img, idx) => {
                const thumbUrl = img.image.url.startsWith("http")
                  ? img.image.url
                  : `${apiBase}${img.image.url}`;

                return (
                  <div
                    key={idx}
                    className="relative w-full h-24 border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
                    onClick={() => setMainImage(thumbUrl)}
                  >
                    <Image
                      width={100}
                      height={100}
                      src={thumbUrl}
                      alt={img.image.alt || product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">
              ₹{product.regularPrice}
              {product.salePrice && (
                <span className="ml-2 text-sm text-red-600 line-through">
                  ₹{product.salePrice}
                </span>
              )}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Availability:</span>{" "}
              {product.stockStatus || "In Stock"}
            </p>
            {product.brand && (
              <p className="text-gray-600">
                <span className="font-medium">Brand:</span> {product.brand}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="text-gray-700">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-sm leading-relaxed">{descriptionText}</p>
          </div>

          {/* Attributes */}
          {attributes.length > 0 && (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Specifications</h2>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                {attributes.map((attr) => (
                  <div key={attr.attribute.id} className="flex flex-col">
                    <span className="font-medium">{attr.attribute.name}</span>
                    <span>
                      {attr.values?.map((val) => val.value).join(", ") || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 text-sm font-medium transition duration-200">
              Add to Cart
            </button>
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-100 text-sm font-medium transition duration-200">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
