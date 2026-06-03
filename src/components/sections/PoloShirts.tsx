import ProductCard from "@/components/ui/ProductCard";
import { poloShirts } from "@/lib/products";

export default function PoloShirts() {
  return (
    <section className="w-full bg-white px-[30px] py-[40px] min-[1440px]:px-20 min-[1440px]:py-[60px] max-[480px]:px-4 max-[480px]:py-6 max-[360px]:px-3 max-[360px]:py-5">
      <div className="flex w-full items-center justify-between min-[1440px]:mb-10 max-[360px]:gap-1.5">
        <h2 className="m-0 text-[clamp(18px,2.2vw,32px)] font-normal leading-[27.65px] tracking-[1px] text-[#111] max-[768px]:text-[clamp(22px,3vw,45px)] max-[480px]:text-[16px] max-[480px]:leading-[1.3] max-[360px]:flex-1 max-[360px]:text-left max-[360px]:text-[16px]">
          Polo T-shirts
        </h2>
        <button className="cursor-pointer whitespace-nowrap rounded-[30px] bg-[#ff5b1f] px-[18px] py-2.5 font-semibold text-white max-[480px]:h-auto max-[480px]:px-3.5 max-[480px]:py-2 max-[480px]:text-[11px] max-[360px]:ml-auto max-[360px]:px-3 max-[360px]:py-[7px] max-[360px]:text-[10px]">
          DISCOVER MORE
        </button>
      </div>

      <div className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto max-[1024px]:gap-[18px] max-[768px]:gap-4">
        <button className="left">‹</button>

        <div className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto max-[1024px]:gap-[18px] max-[768px]:gap-4">
          {poloShirts.map((item) => (
            <ProductCard key={item.alt} variant="polo" product={item} />
          ))}
        </div>

        <button className="right">›</button>
      </div>
    </section>
  );
}
