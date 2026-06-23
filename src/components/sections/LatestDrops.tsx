import Link from "next/link";
import JerseyCard from "@/components/ui/JerseyCard";
import { getProductsByCategory } from "@/lib/catalog";

export default async function LatestDrops({
  productPage = false,
  excludeSlug,
}: {
  productPage?: boolean;
  excludeSlug?: string;
}) {
  const allJerseys = await getProductsByCategory("ipl-jersey");

  const products = productPage
    ? allJerseys.filter((p) => p.slug !== excludeSlug).slice(0, 4)
    : allJerseys.slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="w-full bg-[#f5f5f5] px-[clamp(16px,4vw,80px)] py-[60px]">
      <div className="mb-8 flex items-center justify-between gap-5">
        <h2
          className={`font-extrabold text-[#111] ${
            productPage ? "text-[22px] sm:text-[30px]" : "text-[clamp(22px,3vw,40px)]"
          }`}
        >
          {productPage ? "You May Also Like" : "Latest Drops"}
        </h2>

        {!productPage && (
          <Link
            href="/category/ipl-jersey"
            className="flex h-10 items-center whitespace-nowrap rounded-full bg-[#ff5b1f] px-5 text-[12px] font-bold text-white sm:h-11 sm:px-7 sm:text-[13px]"
          >
            DISCOVER MORE
          </Link>
        )}
      </div>

      <div
        className="
          scrollbar-hide
          flex gap-4
          snap-x snap-mandatory overflow-x-auto pb-2.5
          [&>*]:shrink-0 [&>*]:snap-center
          [&>*]:w-[85%]

          sm:[&>*]:w-[calc(50%-10px)]

          lg:grid lg:grid-cols-4 lg:gap-[18px] lg:overflow-visible lg:snap-none lg:pb-0
          lg:[&>*]:w-auto lg:[&>*]:shrink
        "
      >
        {products.map((product) => (
          <JerseyCard
            key={product.slug}
            product={product}
            compact={productPage}
            href={`/product/${product.slug}`}
          />
        ))}
      </div>
    </section>
  );
}