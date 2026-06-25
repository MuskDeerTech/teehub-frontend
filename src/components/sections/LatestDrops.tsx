import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { getLatestProducts } from "@/lib/catalog";

export default async function LatestDrops({
  productPage = false,
  excludeSlug,
}: {
  productPage?: boolean;
  excludeSlug?: string;
}) {
  const latestProducts = await getLatestProducts(productPage ? 5 : 4);
  const products = latestProducts
    .filter((product) => product.slug !== excludeSlug)
    .slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="w-full bg-[#f5f5f5] px-[30px] py-[60px] min-[1440px]:px-20 max-[480px]:px-4 max-[360px]:px-3">
      <div className="mb-8 flex items-center justify-between gap-5">
        <h2
          className={`font-extrabold text-[#111] ${
            productPage
              ? "text-[22px] sm:text-[30px]"
              : "text-[clamp(22px,3vw,40px)]"
          }`}
        >
          {productPage ? "You May Also Like" : "Latest Drops"}
        </h2>

        {!productPage && (
          <Link
            href="/new-in"
            className="flex h-10 items-center whitespace-nowrap rounded-full bg-[#ff5b1f] px-5 text-[12px] font-bold text-white sm:h-11 sm:px-7 sm:text-[13px]"
          >
            DISCOVER MORE
          </Link>
        )}
      </div>

      <div
        className="
          scrollbar-hide
          flex gap-6
          snap-x snap-mandatory overflow-x-auto pb-2.5
          [&>*]:shrink-0 [&>*]:snap-center
          [&>*]:w-[70%]

          sm:[&>*]:w-[42%]

          lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:snap-none lg:pb-0
          lg:[&>*]:w-auto lg:[&>*]:shrink
        "
      >
        {products.map((product) => (
          <ProductCard key={product.slug} variant="polo" product={product} />
        ))}
      </div>
    </section>
  );
}
