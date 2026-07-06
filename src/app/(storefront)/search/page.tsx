import type { Metadata } from "next";
import Link from "next/link";
import ProductGrid from "@/components/ui/ProductGrid";
import { searchProducts } from "@/lib/catalog";

type SearchParams = { q?: string };

// Reads the live query string and hits Postgres, so render at request time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();
  return {
    title: term ? `Search: ${term} - TeeHub` : "Search - TeeHub",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";
  const products = term ? await searchProducts(term) : [];

  return (
    <main className="mx-auto w-full px-[clamp(16px,4vw,80px)] py-10">
      <h1 className="text-[22px] font-bold uppercase tracking-[1px] text-black">
        {term ? `Results for “${term}”` : "Search"}
      </h1>
      {term && (
        <p className="mt-1 text-[14px] text-[#777]">
          {products.length} {products.length === 1 ? "product" : "products"} found
        </p>
      )}

      {!term ? (
        <p className="mt-20 text-center text-[15px] text-[#777]">
          Type a search in the bar above to find products.
        </p>
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="mt-20 text-center">
          <p className="text-[15px] text-[#777]">
            No products match your search.
          </p>
          <Link
            href="/category/all"
            className="mt-4 inline-block rounded-full bg-[#ff5b1f] px-6 py-3 text-[14px] font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-[#e94e16]"
          >
            Browse all products
          </Link>
        </div>
      )}
    </main>
  );
}
