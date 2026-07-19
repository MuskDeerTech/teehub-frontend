import type { Metadata } from "next";
import { Suspense } from "react";
import NewInFilter from "@/components/category/NewInFilter";
import FilterableGrid from "@/components/category/FilterableGrid";
import { getCategories, getLatestProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New In - TeeHub",
  description: "Shop the latest drops — newest products first.",
};

export default async function NewInPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getLatestProducts(),
  ]);

  return (
    <main className="mx-auto w-full px-[clamp(16px,4vw,80px)] py-10">
      <div className="mb-6">
        <h1 className="text-[clamp(24px,3vw,36px)] font-extrabold tracking-tight text-[#111]">
          New In
        </h1>
        <p className="mt-2 text-[14px] text-[#666]">
          {products.length > 0
            ? `${products.length} products — sorted by newest first.`
            : "Check back soon for the latest drops."}
        </p>
      </div>

      <Suspense fallback={null}>
        {/* getLatestProducts returns the whole published catalog (date-sorted),
            so it doubles as the panel's catalog-wide product list. */}
        <NewInFilter categories={categories} catalogProducts={products} />
      </Suspense>

      {products.length > 0 ? (
        <Suspense fallback={null}>
          <FilterableGrid products={products} />
        </Suspense>
      ) : (
        <p className="mt-20 text-center text-[15px] text-[#777]">
          No products here yet — check back soon.
        </p>
      )}
    </main>
  );
}
