"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Stars } from "@/components/Stars";

interface Review {
  _id: string;
  title?: string;
  product: string;
  user?: string;
  rating: number;
  review: string;
  createdAt?: string;
}


const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data?.docs || [];
};

export default function ProductReviewsPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const { data: productData } = useSWR(
    slug
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/products?where[slug][equals]=${encodeURIComponent(slug)}&depth=1`
      : null,
    fetcher
  );

  const product = productData?.[0];

  const { data: reviews } = useSWR(
    product
      ? 
       `${process.env.NEXT_PUBLIC_API_URL}/api/reviews?where[product][equals]=${product.id}&limit=10&where[status][equals]=approved`
      : null,
    fetcher
  );

  if (!product) return <div>Loading product...</div>;

  return (
    <main className="px-4 py-8">
      <Link href={`/products/${slug}`} className="text-orange-500 underline mb-4 block">
        ← Back to Product
      </Link>

      <h1 className="text-2xl font-bold mb-6">{product.name} - Reviews</h1>

      <div className="space-y-4">
        {reviews?.map((r: Review) => (
          <div key={r._id} className="border p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{r.title || "Review"}</span>
              <Stars rating={r.rating} />
            </div>
            <p className="text-gray-600 text-sm">{r.review}</p>
          </div>
        ))}
        {reviews?.length === 0 && <p>No reviews yet.</p>}
      </div>
    </main>
  );
}
