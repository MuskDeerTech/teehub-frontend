"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import { Product } from "@/types/Product";

async function getProductsFromSearchParams(
  searchParams: Record<string, string> = {}
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (searchParams.category) {
    const cats = searchParams.category.split(",").filter(Boolean);
    cats.forEach((c) => params.append("where[categories][in]", c));
  }

  if (searchParams.minPrice)
    params.set("where[regularPrice][gte]", String(searchParams.minPrice));
  if (searchParams.maxPrice)
    params.set("where[regularPrice][lte]", String(searchParams.maxPrice));

  Object.entries(searchParams).forEach(([k, v]) => {
    if (k.startsWith("attr_")) {
      const values = v.split(",").filter(Boolean);
      values.forEach((val) => {
        params.append("where[attributes.selectedValues][contains]", val);
      });
    }
  });

  const res = await api.get(`/products?${params.toString()}&depth=2`);
  return res.data?.docs || [];
}

async function getCategories(): Promise<{ label: string; value: string }[]> {
  const res = await api.get("/categories");
  return (
    res.data?.docs?.map((cat: { id: string; name: string }) => ({
      label: cat.name,
      value: cat.id,
    })) || []
  );
}

export default function ProductsPageContent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [sortBy, setSortBy] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const [products, cats] = await Promise.all([
        getProductsFromSearchParams(),
        getCategories(),
      ]);
      setAllProducts(products);
      setFilteredProducts(products);
      setCategories(cats);
    };
    fetchData();
  }, []); // ✅ fine: no missing deps

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    const sortedProducts = [...filteredProducts];
    if (e.target.value === "priceAsc") {
      sortedProducts.sort((a, b) => a.regularPrice - b.regularPrice);
    } else if (e.target.value === "priceDesc") {
      sortedProducts.sort((a, b) => b.regularPrice - a.regularPrice);
    }
    setFilteredProducts(sortedProducts);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <ProductFilters
            categories={categories}
            products={allProducts}
            onFiltered={(filtered) => setFilteredProducts(filtered)}
          />
        </aside>
        <section className="md:col-span-3">
          <div className="mb-4 flex justify-end">
            <select
              aria-label="Sort by"
              className="border rounded p-2 text-sm"
              value={sortBy}
              onChange={handleSort}
            >
              <option value="">Sort By</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
          <ProductGrid products={filteredProducts} />
          {filteredProducts.length === 0 && (
            <p className="text-gray-500 mt-4">
              No products found for the selected filters.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
