"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";
import { transformWordPressProducts } from "@/utils/transformers";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const wpApiBase = process.env.NEXT_PUBLIC_WP_API_URL || "https://teehubshop.com/wp-json/wp/v2";

  useEffect(() => {
    if (!slug) return;

    const fetchCategoryProducts = async () => {
      try {
        // Decode and format slug
        const categorySlug = Array.isArray(slug) ? slug[0] : slug;
        const formattedName = decodeURIComponent(categorySlug.toString())
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // Find category by slug
        const categoryRes = await fetch(
          `${wpApiBase}/product_cat?slug=${categorySlug}`
        );
        const categories = await categoryRes.json();
        const category = categories[0];

        if (!category) {
          setCategoryName("Category not found");
          setProducts([]);
          setLoading(false);
          return;
        }

        setCategoryName(category.name || formattedName);

        // Fetch products in this category
        const productsRes = await fetch(
          `${wpApiBase}/product?product_cat=${category.id}&per_page=100`
        );
        const wpProducts = await productsRes.json();

        // Transform to app format
        const transformedProducts = transformWordPressProducts(wpProducts);
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error loading category:", error);
        setCategoryName("Error loading category");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug, wpApiBase]);

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}