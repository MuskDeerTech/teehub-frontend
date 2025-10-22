"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchCategoryProducts = async () => {
      try {
        // Fetch category by name (case-insensitive)
        const categoryRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/categories?where[name][like]=${decodeURIComponent(
            slug.toString().replace(/-/g, " ")
          )}`
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

        // Fetch products for this category
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?where[categories.id][equals]=${categoryId}&depth=2`
        );
        const data = await res.json();

        setCategoryName(category.name || slug.toString().replace(/-/g, " "));
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
