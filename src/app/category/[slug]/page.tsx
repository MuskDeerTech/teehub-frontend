"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/Product";

export default function CategoryPage() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchCategoryProducts = async () => {
      try {
        // 1️⃣ Fetch category details by slug
        const categoryRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories?where[slug][equals]=${slug}`
        );
        const categoryData = await categoryRes.json();
        const category = categoryData?.docs?.[0];
        const categoryId = category?.id;

        if (!categoryId) {
          setCategoryName("Category not found");
          setProducts([]);
          setLoading(false);
          return;
        }

        // ✅ 2️⃣ Correct query: match by nested relationship id
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?where[categories.id][equals]=${categoryId}&depth=2`
        );
        const data = await res.json();

        setCategoryName(category.name || slug);
        setProducts(data.docs || []);
      } catch (error) {
        console.error("Error loading category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-500">
        Loading products...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 capitalize">{categoryName}</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => {
            const imageUrl = product.images?.[0]?.image?.url
              ? product.images[0].image.url.startsWith("http")
                ? product.images[0].image.url
                : `${apiBase}${product.images[0].image.url}`
              : "/placeholder.png";

            return (
              <Link
                href={`/products/${product.slug}`}
                key={product.id}
                className="border rounded-lg p-3 hover:shadow-lg transition"
              >
                <div className="aspect-square relative mb-2">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <h2 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-600">
                  ₹{product.salePrice || product.regularPrice}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
