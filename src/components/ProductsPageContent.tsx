"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import Image from "next/image";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import { Product } from "@/types/Product";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export default function ProductsPageContent() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch products from API route
  const { data: allProducts, error: productsError } = useSWR(
    "/api/products",
    fetcher,
    { dedupingInterval: 300000, revalidateOnFocus: false }
  );

  // Fetch categories from WordPress
  const { data: categories, error: categoriesError } = useSWR(
    "https://teehubshop.com/wp-json/wp/v2/product_cat?per_page=100",
    fetcher,
    { dedupingInterval: 3600000, revalidateOnFocus: false }
  );

  useEffect(() => {
    if (allProducts) setFilteredProducts(allProducts);
  }, [allProducts]);

  if (productsError || categoriesError) {
    console.error("Error fetching data:", productsError || categoriesError);
  }

  const sortedProducts = useMemo(() => {
    const list = [...(filteredProducts || [])];
    if (sortBy === "priceAsc") {
      list.sort((a, b) => {
        const priceA = a.salePrice ?? a.regularPrice ?? 0;
        const priceB = b.salePrice ?? b.regularPrice ?? 0;
        return priceA - priceB;
      });
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => {
        const priceA = a.salePrice ?? a.regularPrice ?? 0;
        const priceB = b.salePrice ?? b.regularPrice ?? 0;
        return priceB - priceA;
      });
    }
    return list;
  }, [filteredProducts, sortBy]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setIsSortOpen(false);
  };

  const SortDropdown = () => (
    <div className="relative" ref={sortRef}>
      <button
        onClick={() => setIsSortOpen(!isSortOpen)}
        className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white hover:bg-gray-100 transition"
      >
        <span className="text-gray-700 font-medium">Sort By</span>
        <svg
          className="w-6 h-6"
          width="32"
          height="26"
          viewBox="0 0 32 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 16H1M10 10H1M7 4H1M16 22H1M26.5 25V1M26.5 25L31 20.5M26.5 25L22 20.5M26.5 1L31 5.5M26.5 1L22 5.5"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isSortOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
          {[
            { label: "Price: Low to High", value: "priceAsc" },
            { label: "Price: High to Low", value: "priceDesc" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`flex items-center w-full gap-3 px-4 py-2 text-sm transition ${
                sortBy === option.value
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
            >
              <span
                className={`w-5 h-5 flex items-center justify-center rounded-full border transition ${
                  sortBy === option.value
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-400"
                }`}
              >
                {sortBy === option.value && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Mobile header with filter + sort */}
        <div className="flex items-center justify-between md:justify-end mb-4 md:hidden">
          {/* Filter button */}
          <button
            className="text-black"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Image
              unoptimized
              src="/hamburger.svg"
              alt="Filter"
              width={24}
              height={24}
            />
          </button>

          {/* Sort dropdown for mobile */}
          <SortDropdown />
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`md:w-1/4 w-full ${
            isFilterOpen ? "flex" : "hidden"
          } md:flex`}
        >
          <ProductFilters
            categories={
              categories?.map((cat: { id: number; name: string }) => ({
                label: cat.name,
                value: cat.id.toString(),
              })) || []
            }
            products={allProducts || []}
            onFiltered={setFilteredProducts}
          />
        </aside>

        {/* Product Section */}
        <section className="md:w-3/4 w-full">
          {/* Desktop Sort Dropdown */}
          <div className="mb-4 flex justify-end hidden md:flex">
            <SortDropdown />
          </div>

          {/* Product List or Skeleton */}
          {!allProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(9)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden bg-white animate-pulse"
                  >
                    <div className="w-full h-64 bg-gray-300" />
                    <div className="p-3">
                      <div className="h-6 w-3/4 bg-gray-300 mt-2" />
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-5 w-16 bg-gray-300" />
                        <div className="h-5 w-12 bg-gray-300" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
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
