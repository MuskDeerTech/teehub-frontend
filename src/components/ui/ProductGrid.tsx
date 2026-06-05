"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import ProductTile from "@/components/ui/ProductTile";
import Pagination from "@/components/ui/Pagination";

/** How many product cards show on a single category page before paging. */
const PER_PAGE = 9;

const gridClass =
  "mt-9 grid grid-cols-3 gap-x-5 gap-y-10 max-[640px]:grid-cols-2 max-[420px]:grid-cols-1";

/**
 * Client-side paginated product grid. The full product list is passed in from
 * the (statically rendered) category page; paging happens in the browser, so it
 * works with the static export — no server or query params needed. Once a
 * category holds more than PER_PAGE products, the overflow flows onto page 2+.
 */
export default function ProductGrid({ products }: { products: Product[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const pageProducts = products.slice(start, start + PER_PAGE);

  return (
    <>
      <div className={gridClass}>
        {pageProducts.map((product) => (
          <ProductTile key={product.slug} product={product} />
        ))}
      </div>

      <Pagination
        current={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
