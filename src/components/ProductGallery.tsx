"use client";

import { useState } from "react";
import Image from "next/image";
interface ImageType {
  image: { url: string; alt?: string };
}

interface ProductGalleryProps {
  images: ImageType[];
  apiBase: string;
  productName: string;
}

export default function ProductGallery({ images, apiBase, productName }: ProductGalleryProps) {
  // State for main image
  const [mainImage, setMainImage] = useState(
    images?.[0]?.image?.url
      ? images[0].image.url.startsWith("http")
        ? images[0].image.url
        : `${apiBase}${images[0].image.url}`
      : "/placeholder.png"
  );

  const thumbnailImages = images?.slice(1) || [];

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="relative w-full h-[500px] border rounded-lg overflow-hidden shadow-md">
        <Image
          width={800}
          height={800}
          src={mainImage}
          alt={productName}
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
                  alt={img.image.alt || productName}
                  className="object-cover w-full h-full"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
