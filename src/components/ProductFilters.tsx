"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/types/Product"; // ✅ use the same type everywhere

type AttrValue = { id: string; value: string };
type Attr = { id: string; name: string; values: AttrValue[] };


interface AttributeAPI {
  id: string;
  name: string;
}

interface AttributeValueAPI {
  id: string;
  value: string; // comma-separated string
}

interface Category {
  label: string;
  value: string;
}


interface Props {
  categories: Category[];
  products: Product[];
  onFiltered: (filtered: Product[]) => void;
}

export default function ProductFilters({
  categories,
  products,
  onFiltered,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI state
  const [category, setCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [minPrice, setMinPrice] = useState<number>(
    Number(searchParams.get("minPrice")) || 0
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    Number(searchParams.get("maxPrice")) || 5000
  );

  // Attributes fetched from backend
  const [attributes, setAttributes] = useState<Attr[]>([]);

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >(() => {
    const init: Record<string, string[]> = {};
    if (searchParams) {
      Array.from(searchParams.entries()).forEach(([k, v]) => {
        if (k.startsWith("attr_")) {
          const id = k.replace(/^attr_/, "");
          init[id] = v.split(",").filter(Boolean);
        }
      });
    }
    return init;
  });

  // Define the possible sections as a union type
  type AccordionSection =
    | "theme"
    | "category"
    | "colors"
    | "sleeves"
    | "priceRange"
    | "fit";

  // Update the accordionOpen state type
  const [accordionOpen, setAccordionOpen] = useState<{
    [K in AccordionSection]: boolean;
  }>({
    theme: false,
    category: false,
    colors: false,
    sleeves: false,
    priceRange: false,
    fit: false,
  });

  // Fetch attributes and their values from Payload
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const fetchAttributes = async () => {
      try {
        const res = await fetch(`${apiBase}/attributes?limit=100`);
        if (!res.ok)
          throw new Error(`Failed to fetch attributes: ${res.status}`);
        const data = await res.json();
        if (!data?.docs) {
          setAttributes([]);
          return;
        }

        const attrs: Attr[] = await Promise.all(
  data.docs.map(async (attr: AttributeAPI) => {
    const valsRes = await fetch(
      `${apiBase}/attribute-values?where[attribute][equals]=${attr.id}&limit=200`
    );
    const valsData = await valsRes.json();
    const values: AttrValue[] =
      valsData?.docs?.flatMap((v: AttributeValueAPI) =>
        v.value.split(",").map((val) => ({
          id: `${v.id}-${val.trim()}`,
          value: val.trim(),
        }))
      ) || [];

    return {
      id: attr.id,
      name: attr.name,
      values,
    };
  })
);


        setAttributes(attrs);
      } catch (err) {
        console.error("Error fetching attributes:", err);
        setAttributes([]);
      }
    };

    fetchAttributes();
  }, []);

  // Toggle a value for an attribute
  const toggleValue = (attributeId: string, value: string) => {
    setSelectedFilters((prev) => {
      const existing = prev[attributeId] || [];
      const next = existing.includes(value)
        ? existing.filter((x) => x !== value)
        : [...existing, value];
      return { ...prev, [attributeId]: next };
    });
  };

  // Filter products
  const filterProducts = (baseProducts: Product[] = products) => {
    const filtered = baseProducts.filter((product) => {
      // Category filter
      if (category && !product.categories?.some((c) => c.id === category))
        return false;

      // Price filter
      const price = product.salePrice ?? product.regularPrice;
      if (price < minPrice || price > maxPrice) return false;

      // Attribute filter
      for (const [attrId, selectedVals] of Object.entries(selectedFilters)) {
        if (!selectedVals.length) continue;

        let matched = false;

        // Check attributes
        const attr = product.attributes?.find((a) => a.attribute.id === attrId);
        if (attr) {
          const values = (attr.values || []).map((v) =>
            v.value.trim().toLowerCase()
          );
          if (selectedVals.some((val) => values.includes(val.toLowerCase()))) {
            matched = true;
          }
        }

        if (!matched) return false; // If this filter fails, reject product
      }

      return true; // Passes all filters
    });

    onFiltered(filtered);
  };

  // Apply filters and update URL
  const applyFilters = () => {
    filterProducts();

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", String(minPrice));
    if (maxPrice) params.set("maxPrice", String(maxPrice));

    Object.entries(selectedFilters).forEach(([attrId, values]) => {
      if (values.length) params.set(`attr_${attrId}`, values.join(","));
    });

    router.push(`/products?${params.toString()}`);
  };

  // Reset
  const resetFilters = () => {
    setCategory("");
    setMinPrice(0);
    setMaxPrice(5000);
    setSelectedFilters({});
    onFiltered(products);
    router.push("/products");
  };

  // Auto-apply filters on state change
  useEffect(() => {
    applyFilters();
  }, [category, minPrice, maxPrice, selectedFilters]);

  // Toggle accordion section
  const toggleAccordion = (section: AccordionSection) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className="p-4 max-w-sm filter-sidebar">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      {/* Theme Accordion */}
      <div className="mb-4">
        <button
          onClick={() => toggleAccordion("theme")}
          className="w-full text-left text-sm font-medium mb-2 flex justify-between items-center"
        >
          Theme
          <span>{accordionOpen.theme ? "-" : "+"}</span>
        </button>
        {accordionOpen.theme && (
          <div className="flex flex-col gap-2">
            {attributes
              .find((attr) => attr.name.toLowerCase() === "theme")
              ?.values.map((v) => {
                const checked =
                  selectedFilters["68db7fc0e34a4d8402b29509"]?.includes(
                    v.value
                  ) || false; // Assuming Theme attribute ID
                return (
                  <label key={v.id} className="flex justify-between items-center gap-2 text-sm">
                    
                    <span>{v.value}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleValue("68db7fc0e34a4d8402b29509", v.value)
                      }
                      
                    />
                  </label>
                );
              })}
          </div>
        )}
      </div>

      {/* Category Accordion */}
      <div className="mb-4">
        <button style={{justifyContent: "space-between"}}
          onClick={() => toggleAccordion("category")}
          className="w-full text-left text-sm font-medium mb-2 flex justify-between items-center"
        >
          Category
          <span>{accordionOpen.category ? "-" : "+"}</span>
        </button>
        {accordionOpen.category && (
          <select
            id="category"
            aria-label="Filter by category" // Added accessible name
            className="w-full border rounded p-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Colors Accordion */}
      <div className="mb-4">
        <button
          onClick={() => toggleAccordion("colors")}
          className="w-full text-left text-sm font-medium mb-2 flex justify-between items-center"
        >
          Colors
          <span>{accordionOpen.colors ? "-" : "+"}</span>
        </button>
        {accordionOpen.colors && (
          <div className="flex flex-col gap-2">
            {attributes
              .find((attr) => attr.name.toLowerCase() === "color")
              ?.values.map((v) => {
                const checked =
                  selectedFilters["68db7e5ee34a4d8402b294df"]?.includes(
                    v.value
                  ) || false; // Assuming Color attribute ID
                return (
                  <label key={v.id} className="flex items-center gap-2 text-sm  justify-between">
                   
                    <span>{v.value}</span>
                     <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleValue("68db7e5ee34a4d8402b294df", v.value)
                      }
                      
                    />
                  </label>
                );
              })}
          </div>
        )}
      </div>

      {/* Sleeves Accordion */}
      <div className="mb-4">
        <button
          onClick={() => toggleAccordion("sleeves")}
          className="w-full text-left text-sm font-medium mb-2 flex justify-between items-center"
        >
          Sleeves
          <span>{accordionOpen.sleeves ? "-" : "+"}</span>
        </button>
        {accordionOpen.sleeves && (
          <div className="flex flex-col gap-2">
            {attributes
              .find((attr) => attr.name.toLowerCase() === "sleeve type")
              ?.values.map((v) => {
                const checked =
                  selectedFilters["68d51cc58b6e969778b57f94"]?.includes(
                    v.value
                  ) || false; // Assuming Sleeve Type attribute ID
                return (
                  <label key={v.id} className="flex items-center gap-2 text-sm justify-between">
                  
                    <span>{v.value}</span>
                      <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleValue("68d51cc58b6e969778b57f94", v.value)
                      }
                      
                    />
                  </label>
                );
              })}
          </div>
        )}
      </div>

      {/* Price Range Accordion */}
      <div className="mb-4">
        <button
          onClick={() => toggleAccordion("priceRange")}
          className="w-full text-left text-sm font-medium mb-2 flex justify-between items-center"
        >
          Price Range
          <span>{accordionOpen.priceRange ? "-" : "+"}</span>
        </button>
        {accordionOpen.priceRange && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">
              Price: ₹{minPrice} - ₹{maxPrice}
            </p>
            <label htmlFor="minPrice" className="sr-only">
              Minimum price
            </label>
            <input
              id="minPrice"
              type="range"
              min={0}
              max={5000}
              step={50}
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full mb-1"
            />
            <label htmlFor="maxPrice" className="sr-only">
              Maximum price
            </label>
            <input
              id="maxPrice"
              type="range"
              min={0}
              max={5000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Fit Accordion */}
      <div className="mb-4">
        <button
          onClick={() => toggleAccordion("fit")}
          className="w-full text-left text-sm font-medium mb-2 flex justify-between items-center"
        >
          Fit
          <span>{accordionOpen.fit ? "-" : "+"}</span>
        </button>
        {accordionOpen.fit && (
          <div className="flex flex-col gap-2">
            {attributes
              .find((attr) => attr.name.toLowerCase() === "fit")
              ?.values.map((v) => {
                const checked =
                  selectedFilters["68db7f9ae34a4d8402b294f4"]?.includes(
                    v.value
                  ) || false; // Assuming Fit attribute ID
                return (
                  <label key={v.id} className="flex items-center gap-2 text-sm justify-between">
                       <span>{v.value}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleValue("68db7f9ae34a4d8402b294f4", v.value)
                      }
                      
                    />
                 
                  </label>
                );
              })}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={applyFilters}
          className="flex-1 px-3 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
        >
          Apply
        </button>
        <button
          onClick={resetFilters}
          className="px-3 py-2 border rounded text-sm hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
