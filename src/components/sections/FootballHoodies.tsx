import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { footballHoodies } from "@/lib/products";

export default function FootballHoodies() {
  return (
    <section className="mx-auto box-border w-full max-w-[1440px] px-[30px] py-[40px] min-[1440px]:px-20 min-[1440px]:py-[60px] max-[480px]:px-4 max-[480px]:py-6">
      <div className="mb-[30px] flex items-center justify-between">
        <h2 className="m-0 text-[clamp(18px,2.2vw,32px)] font-normal tracking-[1px] text-[#111] max-[480px]:flex-1 max-[480px]:text-left max-[480px]:text-[16px] max-[480px]:leading-[1.3]">
          Football Hoodies
        </h2>
        <Link
          href="/category/hoodies"
          className="flex h-11 items-center rounded-full bg-[#ff5b1f] px-6 text-[14px] font-medium text-white max-[480px]:ml-auto max-[480px]:whitespace-nowrap max-[480px]:px-3.5 max-[480px]:py-2 max-[480px]:text-[11px] max-[360px]:px-3 max-[360px]:py-[7px] max-[360px]:text-[10px]"
        >
          DISCOVER MORE
        </Link>
      </div>

      <div>
        <button className="left">‹</button>

        <div className="scrollbar-hide grid grid-cols-4 gap-7 min-[1440px]:grid min-[1440px]:grid-cols-4 min-[1440px]:items-start min-[1440px]:gap-8 max-[1024px]:flex max-[1024px]:snap-x max-[1024px]:snap-mandatory max-[1024px]:gap-[18px] max-[1024px]:overflow-x-auto max-[768px]:flex max-[768px]:snap-x max-[768px]:snap-mandatory max-[768px]:gap-4 max-[768px]:overflow-x-auto">
          {footballHoodies.map((item) => (
            <ProductCard key={item.title} variant="hoodie" product={item} />
          ))}
        </div>

        <button className="right">›</button>
      </div>
    </section>
  );
}
