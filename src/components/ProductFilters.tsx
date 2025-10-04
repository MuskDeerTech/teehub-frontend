"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/Product";

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
  // UI state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  // Attributes fetched from backend
  const [attributes, setAttributes] = useState<Attr[]>([]);

  // Selected filters: attributeName → values
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  // Accordion open state
  // Accordion open state
  type AccordionSection =
    | "theme"
    | "category"
    | "colors"
    | "sleeves"
    | "priceRange"
    | "fit";

  const [accordionOpen, setAccordionOpen] = useState<
    Record<AccordionSection, boolean>
  >({
    theme: true,
    category: true,
    colors: true,
    sleeves: true,
    priceRange: true, // ✅ open by default
    fit: true, // also open fit
  });

  // Track "show more" per attribute
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});

  // Fetch attributes
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const fetchAttributes = async () => {
      try {
        const res = await fetch(`${apiBase}/attributes?limit=100`);
        if (!res.ok) throw new Error(`Failed to fetch attributes`);
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

            return { id: attr.id, name: attr.name, values };
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

  // Toggle filter value
  const toggleValue = (attributeName: string, value: string) => {
    setSelectedFilters((prev) => {
      const key = attributeName.toLowerCase();
      const existing = prev[key] || [];
      const next = existing.includes(value)
        ? existing.filter((x) => x !== value)
        : [...existing, value];
      return { ...prev, [key]: next };
    });
  };

  // Filter products whenever filters change
  const filterProducts = useCallback(() => {
    const filtered = products.filter((product) => {
      // Category filter
      if (selectedCategories.length > 0) {
        const productCats = product.categories?.map((c) => c.id) || [];
        if (!selectedCategories.some((cat) => productCats.includes(cat))) {
          return false;
        }
      }

      // Price filter
      const price = product.salePrice ?? product.regularPrice;
      if (price < minPrice || price > maxPrice) return false;

      // Attribute filters
      for (const [attrName, selectedVals] of Object.entries(selectedFilters)) {
        if (!selectedVals.length) continue;

        const attr = product.attributes?.find(
          (a) => a.attribute.name.toLowerCase() === attrName
        );
        if (!attr) return false;

        const values = (attr.values || []).map((v) =>
          v.value.trim().toLowerCase()
        );

        if (!selectedVals.some((val) => values.includes(val.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });

    onFiltered(filtered);
  }, [
    products,
    selectedCategories,
    minPrice,
    maxPrice,
    selectedFilters,
    onFiltered,
  ]); // ✅ Add selectedCategories here

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(5000);
    setSelectedFilters({});
    setSelectedCategories([]); // ✅ Add this
    onFiltered(products);
  };

  const toggleAccordion = (section: AccordionSection) => {
    setAccordionOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper: render checkboxes with "show more"
  const renderCheckboxes = (attrName: string) => {
    const attr = attributes.find(
      (a) => a.name.toLowerCase() === attrName.toLowerCase()
    );
    if (!attr) return null;

    const isExpanded = showMore[attrName] || false;
    const valuesToShow = isExpanded ? attr.values : attr.values.slice(0, 4);

    return (
      <div className="flex flex-col gap-2">
        {valuesToShow.map((v) => {
          const checked = selectedFilters[attrName.toLowerCase()]?.includes(
            v.value
          );
          return (
            <label
              key={v.id}
              className="flex items-center justify-between text-sm gap-2"
            >
              <span>{v.value}</span>
              <input
                type="checkbox"
                checked={!!checked}
                onChange={() => toggleValue(attrName, v.value)}
              />
            </label>
          );
        })}
        {attr.values.length > 4 && (
          <button
            className="text-xs text-blue-600 mt-1 self-start"
            onClick={() =>
              setShowMore((prev) => ({
                ...prev,
                [attrName]: !isExpanded,
              }))
            }
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
    );
  };

  return (
    <aside className="p-4 max-w-xs filter-sidebar ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Theme */}
      <div className="mb-4 border-b pb-2">
        <button
          onClick={() => toggleAccordion("theme")}
          className="w-full flex justify-between items-center text-sm font-medium mb-2"
        >
          Theme <span>{accordionOpen.theme ? "-" : "+"}</span>
        </button>
        {accordionOpen.theme && renderCheckboxes("theme")}
      </div>

      {/* Category */}
      <div className="mb-4 border-b pb-2">
        <button
          onClick={() => toggleAccordion("category")}
          className="w-full flex justify-between items-center text-sm font-medium mb-2"
        >
          Category <span>{accordionOpen.category ? "-" : "+"}</span>
        </button>
        {accordionOpen.category && (
          <div className="flex flex-col gap-2">
            {(showMore["category"] ? categories : categories.slice(0, 4)).map(
              (c) => {
                const checked = selectedCategories.includes(c.value);
                return (
                  <label
                    key={c.value}
                    className="flex items-center justify-between text-sm gap-2"
                  >
                    <span>{c.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(c.value)}
                    />
                  </label>
                );
              }
            )}
            {categories.length > 4 && (
              <button
                className="text-xs text-blue-600 mt-1 self-start"
                onClick={() =>
                  setShowMore((prev) => ({
                    ...prev,
                    category: !prev["category"],
                  }))
                }
              >
                {showMore["category"] ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="mb-4 border-b pb-2">
        <button
          onClick={() => toggleAccordion("colors")}
          className="w-full flex justify-between items-center text-sm font-medium mb-2"
        >
          Colors <span>{accordionOpen.colors ? "-" : "+"}</span>
        </button>
        {accordionOpen.colors && renderCheckboxes("Colors")}
      </div>

      {/* Sleeves */}
      <div className="mb-4 border-b pb-2">
        <button
          onClick={() => toggleAccordion("sleeves")}
          className="w-full flex justify-between items-center text-sm font-medium mb-2"
        >
          Sleeves <span>{accordionOpen.sleeves ? "-" : "+"}</span>
        </button>
        {accordionOpen.sleeves && renderCheckboxes("Sleeves")}
      </div>

      {/* Price */}
      <div className="mb-4 border-b pb-2">
        <button
          onClick={() => toggleAccordion("priceRange")}
          className="w-full flex justify-between items-center text-sm font-medium mb-2"
        >
          Price Range <span>{accordionOpen.priceRange ? "-" : "+"}</span>
        </button>
        {accordionOpen.priceRange && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Select Price Range</p>
            <div className="relative h-6 mb-3">
              {/* Background track */}
              <div className="absolute inset-y-0 left-0 w-full h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
              {/* Fill track */}
              <div
                className="absolute h-1 bg-orange-500 rounded-full top-1/2 -translate-y-1/2"
                style={{
                  left: `${(minPrice / 5000) * 100}%`,
                  width: `${((maxPrice - minPrice) / 5000) * 100}%`,
                }}
              ></div>
              {/* Min thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"
                style={{
                  left: `${(minPrice / 5000) * 100}%`,
                }}
              ></div>
              {/* Max thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"
                style={{
                  left: `${(maxPrice / 5000) * 100}%`,
                }}
              ></div>
              {/* Hidden min input */}
              <input
                type="range"
                className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer opacity-0"
                min={0}
                max={5000}
                step={50}
                value={minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinPrice(val);
                  if (val > maxPrice) setMaxPrice(val);
                }}
                aria-label="Minimum price"
              />
              {/* Hidden max input */}
              <input
                type="range"
                className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer opacity-0"
                min={0}
                max={5000}
                step={50}
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxPrice(val);
                  if (val < minPrice) setMinPrice(val);
                }}
                aria-label="Maximum price"
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              ₹{minPrice} - ₹{maxPrice} INR
            </p>
          </div>
        )}
      </div>

      {/* Fit */}
      <div className="mb-4 border-b pb-2">
        <button
          onClick={() => toggleAccordion("fit")}
          className="w-full flex justify-between items-center text-sm font-medium mb-2"
        >
          Fit <span>{accordionOpen.fit ? "-" : "+"}</span>
        </button>
        {accordionOpen.fit && renderCheckboxes("fit")}
      </div>
    </aside>
  );
}
