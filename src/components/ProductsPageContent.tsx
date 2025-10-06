"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import { Product } from "@/types/Product";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data?.docs || [];
};

export default function ProductsPageContent() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<string>("");

  const { data: allProducts, error: productsError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/products?limit=100&depth=2`,
    fetcher,
    { dedupingInterval: 300000, revalidateOnFocus: false }
  );

  const { data: categories, error: categoriesError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/categories`,
    fetcher,
    { dedupingInterval: 3600000, revalidateOnFocus: false }
  );

  useEffect(() => {
    if (allProducts) {
      setFilteredProducts(allProducts);
    }
  }, [allProducts]);

  if (productsError || categoriesError) {
    console.error("Error fetching data:", productsError || categoriesError);
  }

  const sortedProducts = useMemo(() => {
    const list = [...(filteredProducts || [])];
    if (sortBy === "priceAsc") {
      return list.sort((a, b) => a.regularPrice - b.regularPrice);
    }
    if (sortBy === "priceDesc") {
      return list.sort((a, b) => b.regularPrice - a.regularPrice);
    }
    return list;
  }, [filteredProducts, sortBy]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <ProductFilters
            categories={
              categories?.map((cat: { id: string; name: string }) => ({
                label: cat.name,
                value: cat.id,
              })) || []
            }
            products={allProducts || []}
            onFiltered={setFilteredProducts}
          />
        </aside>
        <section className="md:col-span-3">
          <div className="mb-4 flex justify-end">
            <select
              aria-label="Sort by"
              className="border rounded p-2 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
          {!allProducts ? (
            <p>Loading products...</p>
          ) : (
            <>
              <ProductGrid products={sortedProducts} />
              {sortedProducts.length === 0 && (
                <p className="text-gray-500 mt-4">
                  No products found for the selected filters.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}