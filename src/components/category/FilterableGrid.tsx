"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { filterProducts, paramsToSelections, type Product } from "@/lib/products";
import ProductGrid from "@/components/ui/ProductGrid";

/**
 * Applies the filter panel's URL selections to the grid. Static export has no
 * server, so the query string is read in the browser: the page hands over the
 * full product list and we narrow it here from `?color=…&size=…&maxPrice=…`.
 * No filters in the URL means every product shows.
 */
export default function FilterableGrid({ products }: { products: Product[] }) {
  const params = useSearchParams();

  const filtered = useMemo(() => {
    const sel = paramsToSelections(params as unknown as URLSearchParams);
    const maxPriceRaw = params.get("maxPrice");
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
    return filterProducts(products, sel, maxPrice);
  }, [params, products]);

  if (filtered.length === 0) {
    return (
      <p className="mt-20 text-center text-[15px] text-[#777]">
        No products match these filters — try removing a few.
      </p>
    );
  }

  return <ProductGrid products={filtered} />;
}
