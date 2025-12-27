"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/Product";

type AttrValue = { id: string; value: string };
type Attr = { id: string; name: string; values: AttrValue[] };

interface Category {
  label: string;
  value: string;
}

interface Props {
  categories: Category[];
  products: Product[];
  onFiltered: (filtered: Product[]) => void;
}

type AccordionSection =
  | "theme"
  | "category"
  | "colors"
  | "sleeves"
  | "priceRange"
  | "fit";

export default function ProductFilters({
  categories,
  products,
  onFiltered,
}: Props) {
  // UI state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  // Attributes extracted from products (WordPress products have attributes in transformed format)
  const [attributes, setAttributes] = useState<Attr[]>([]);

  // Selected filters: attributeName → values
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  // Accordion open state
  const [accordionOpen, setAccordionOpen] = useState<
    Record<AccordionSection, boolean>
  >({
    theme: true,
    category: true,
    colors: true,
    sleeves: true,
    priceRange: true,
    fit: true,
  });

  // Track "show more" per attribute
  const [showMore, setShowMore] = useState<Record<string, boolean>>({});

  // Extract unique attributes from products
  useEffect(() => {
    if (!products || products.length === 0) {
      setAttributes([]);
      return;
    }

    const attributeMap = new Map<string, Set<string>>();

    products.forEach((product) => {
      if (!product.attributes) return;

      product.attributes.forEach((attr) => {
        const attrName = attr.attribute.name;
        if (!attributeMap.has(attrName)) {
          attributeMap.set(attrName, new Set());
        }

        attr.values.forEach((val) => {
          attributeMap.get(attrName)?.add(val.value);
        });
      });
    });

    const attrs: Attr[] = Array.from(attributeMap.entries()).map(
      ([name, valuesSet], index) => ({
        id: `attr-${index}`,
        name,
        values: Array.from(valuesSet).map((value, idx) => ({
          id: `${name}-${idx}`,
          value,
        })),
      })
    );

    setAttributes(attrs);
  }, [products]);

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

  // Filter products
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
      if (price === undefined || price < minPrice || price > maxPrice) {
        return false;
      }

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
  ]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(5000);
    setSelectedFilters({});
    setSelectedCategories([]);
    onFiltered(products);
  };

  const toggleAccordion = (section: AccordionSection) => {
    setAccordionOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderCheckboxes = (attrName: string) => {
    const attr = attributes.find(
      (a) => a.name.toLowerCase() === attrName.toLowerCase()
    );
    if (!attr || attr.values.length === 0) return null;
    
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
              className="flex items-center justify-between text-xs sm:text-sm gap-2 sm:gap-3 py-1"
            >
              <span>{v.value}</span>
              <input
                type="checkbox"
                checked={!!checked}
                onChange={() => toggleValue(attrName, v.value)}
                className="appearance-none w-4 h-4 rounded-full border border-gray-400 checked:bg-orange-500 checked:border-orange-500 relative cursor-pointer
  before:content-['✔'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-10
  before:text-[9px] before:text-white before:opacity-0 checked:before:opacity-100 transition-all duration-200"
              />
            </label>
          );
        })}
        {attr.values.length > 4 && (
          <button
            className="text-xs sm:text-sm text-blue-600 mt-2 self-start"
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
    <aside className="p-3 sm:p-4 w-full filter-sidebar">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold">Filters</h2>
        <button
          onClick={clearAllFilters}
          className="text-xs sm:text-sm text-blue-600 hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Theme */}
      {attributes.some(a => a.name.toLowerCase() === "theme") && (
        <div className="mb-3 sm:mb-4 border-b pb-2 sm:pb-2">
          <button
            onClick={() => toggleAccordion("theme")}
            className="w-full flex justify-between items-center text-xs sm:text-sm font-bold mb-4 sm:mb-2"
          >
            Theme <span>{accordionOpen.theme ? "-" : "+"}</span>
          </button>
          {accordionOpen.theme && renderCheckboxes("theme")}
        </div>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <div className="mb-3 sm:mb-4 border-b pb-2 sm:pb-2">
          <button
            onClick={() => toggleAccordion("category")}
            className="w-full flex justify-between items-center text-xs sm:text-sm font-bold mb-4 sm:mb-2"
          >
            Category <span>{accordionOpen.category ? "-" : "+"}</span>
          </button>
          {accordionOpen.category && (
            <div className="flex flex-col gap-2 sm:gap-3">
              {(showMore["category"]
                ? categories
                : categories.slice(0, 4)
              ).map((c) => {
                const checked = selectedCategories.includes(c.value);
                return (
                  <label
                    key={c.value}
                    className="flex items-center justify-between text-xs sm:text-sm gap-2 sm:gap-3 py-1"
                  >
                    <span>{c.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(c.value)}
                      className="appearance-none w-4 h-4 rounded-full border border-gray-400 checked:bg-orange-500 checked:border-orange-500 relative cursor-pointer
  before:content-['✔'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-10
  before:text-[9px] before:text-white before:opacity-0 checked:before:opacity-100 transition-all duration-200"
                    />
                  </label>
                );
              })}
              {categories.length > 4 && (
                <button
                  className="text-xs sm:text-sm text-blue-600 mt-2 self-start"
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
      )}

      {/* Colors */}
      {attributes.some(a => a.name.toLowerCase() === "colors" || a.name.toLowerCase() === "color") && (
        <div className="mb-3 sm:mb-4 border-b pb-2 sm:pb-2">
          <button
            onClick={() => toggleAccordion("colors")}
            className="w-full flex justify-between items-center text-xs sm:text-sm font-bold mb-4 sm:mb-2"
          >
            Colors <span>{accordionOpen.colors ? "-" : "+"}</span>
          </button>
          {accordionOpen.colors && (renderCheckboxes("Colors") || renderCheckboxes("Color"))}
        </div>
      )}

      {/* Sleeves */}
      {attributes.some(a => a.name.toLowerCase() === "sleeves" || a.name.toLowerCase() === "sleeve") && (
        <div className="mb-3 sm:mb-4 border-b pb-2 sm:pb-2">
          <button
            onClick={() => toggleAccordion("sleeves")}
            className="w-full flex justify-between items-center text-xs sm:text-sm font-bold mb-4 sm:mb-2"
          >
            Sleeves <span>{accordionOpen.sleeves ? "-" : "+"}</span>
          </button>
          {accordionOpen.sleeves && (renderCheckboxes("Sleeves") || renderCheckboxes("Sleeve"))}
        </div>
      )}

      {/* Price */}
      <div className="mb-3 sm:mb-4 border-b pb-2 sm:pb-2">
        <button
          onClick={() => toggleAccordion("priceRange")}
          className="w-full flex justify-between items-center text-xs sm:text-sm font-bold mb-4 sm:mb-2"
        >
          Price Range <span>{accordionOpen.priceRange ? "-" : "+"}</span>
        </button>
        {accordionOpen.priceRange && (
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-bold mb-4 sm:mb-2">
              Select Price Range
            </p>
            <div className="relative h-5 sm:h-6 mb-2 sm:mb-3">
              <div className="absolute inset-y-0 left-0 w-full h-1 sm:h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
              <div
                className="absolute h-1 sm:h-1 bg-orange-500 rounded-full top-1/2 -translate-y-1/2"
                style={{
                  left: `${(minPrice / 5000) * 100}%`,
                  width: `${((maxPrice - minPrice) / 5000) * 100}%`,
                }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 sm:w-3 h-2 sm:h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"
                style={{
                  left: `${(minPrice / 5000) * 100}%`,
                }}
              ></div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 sm:w-3 h-2 sm:h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"
                style={{
                  left: `${(maxPrice / 5000) * 100}%`,
                }}
              ></div>
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
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              ₹{minPrice} - ₹{maxPrice} INR
            </p>
          </div>
        )}
      </div>

      {/* Fit */}
      {attributes.some(a => a.name.toLowerCase() === "fit") && (
        <div className="mb-3 sm:mb-4 border-b pb-2 sm:pb-2">
          <button
            onClick={() => toggleAccordion("fit")}
            className="w-full flex justify-between items-center text-xs sm:text-sm font-bold mb-4 sm:mb-2"
          >
            Fit <span>{accordionOpen.fit ? "-" : "+"}</span>
          </button>
          {accordionOpen.fit && renderCheckboxes("fit")}
        </div>
      )}
    </aside>
  );
}