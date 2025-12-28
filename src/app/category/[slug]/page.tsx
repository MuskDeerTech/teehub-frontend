"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!slug) return;

    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const categorySlug = Array.isArray(slug) ? slug[0] : slug;

        // ✅ Step 1: Fetch ALL products from your Next.js API route
        const productsRes = await fetch("/api/products");
        
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products");
        }

        const allProducts: Product[] = await productsRes.json();
        console.log("All products fetched:", allProducts.length);

        // ✅ Step 2: Filter products by category slug
        const filteredProducts = allProducts.filter((product) =>
          product.categories?.some(
            (cat) => cat.slug.toLowerCase() === categorySlug.toLowerCase()
          )
        );

        console.log(`Products in category "${categorySlug}":`, filteredProducts.length);

        // ✅ Step 3: Get category name from first product
        if (filteredProducts.length > 0) {
          const category = filteredProducts[0].categories?.find(
            (cat) => cat.slug.toLowerCase() === categorySlug.toLowerCase()
          );
          setCategoryName(category?.name || formatCategoryName(categorySlug));
        } else {
          setCategoryName(formatCategoryName(categorySlug));
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error loading category:", error);
        setError("Failed to load products. Please try again.");
        setCategoryName(formatCategoryName(Array.isArray(slug) ? slug[0] : slug));
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug]);

  // Format slug to readable name
  const formatCategoryName = (slug: string) => {
    return decodeURIComponent(slug)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array(8).fill(null).map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden bg-white animate-pulse">
              <div className="w-full h-64 bg-gray-300" />
              <div className="p-3">
                <div className="h-6 w-3/4 bg-gray-300 mt-2" />
                <div className="h-5 w-16 bg-gray-300 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Error</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">{categoryName}</h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No products found in this category.</p>
          <Link href="/" className="text-orange-600 hover:underline">
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}