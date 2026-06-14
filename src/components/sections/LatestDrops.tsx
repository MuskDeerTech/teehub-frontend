import Link from "next/link";
import JerseyCard from "@/components/ui/JerseyCard";
import { latestDrops } from "@/lib/products";

export default function LatestDrops({
  productPage = false,
}: {
  productPage?: boolean;
}) {
  return (
    <section className="w-full bg-[#f5f5f5] px-[clamp(16px,4vw,80px)] py-[60px]">
      <div className="mb-8 flex items-center justify-between gap-5">
        <h2
  className={`font-extrabold text-[#111] ${
    productPage
      ? "text-[30px]"
      : "text-[clamp(24px,3vw,40px)]"
  }`}
>
  {productPage ? "You May Also Like" : "Latest Drops"}
</h2>

        {!productPage && (
          <Link
            href="/category/ipl-jersey"
            className="flex h-11 items-center rounded-full bg-[#ff5b1f] px-7 text-[13px] font-bold text-white"
          >
            DISCOVER MORE
          </Link>
        )}
      </div>

      <div className="scrollbar-hide grid grid-cols-4 gap-[18px] max-[1024px]:flex max-[1024px]:snap-x max-[1024px]:snap-mandatory max-[1024px]:overflow-x-auto max-[1024px]:pb-2.5 max-[768px]:grid max-[768px]:grid-cols-2 max-[768px]:gap-4">
        {latestDrops.map((drop) => (
          <JerseyCard key={drop.title} drop={drop} />
        ))}
      </div>
    </section>
  );
}