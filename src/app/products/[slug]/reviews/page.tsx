// src/app/products/[slug]/reviews/page.tsx
"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Product } from "@/types/Product";
import { Stars } from "@/components/Stars";


const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  const data = await res.json();
  return data?.docs?.[0] || null;
};

export default function ProductReviews() {
  const params = useParams();
  const { slug } = params as { slug: string };

  const { data: product, error } = useSWR<Product>(
    `${process.env.NEXT_PUBLIC_API_URL}/products?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`,
    fetcher
  );

  if (error) return <div>Error loading reviews...</div>;
  if (!product) return <div>Loading...</div>;

  const averageRating = product.reviews?.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;
  const reviewCount = product.reviews?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reviews for {product.name}</h1>
      <div className="flex items-center gap-2 mb-4">
        <Stars rating={averageRating || 0} />
        <span>{averageRating.toFixed(1)} ({reviewCount} reviews)</span>
      </div>
      {product.reviews?.length ? (
        <div className="space-y-6">
          {product.reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                <Stars rating={review.rating} />
                <span className="text-sm font-medium">{review.userName}</span>
                <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}
    </div>
  );
}