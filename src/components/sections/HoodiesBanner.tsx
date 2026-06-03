import Image from "next/image";
import Dots from "@/components/ui/Dots";

export default function HoodiesBanner() {
  return (
    <section className="relative w-full min-h-[720px] overflow-hidden">
      <Image
        src="/images/hoodiesbanner.png"
        alt="Hoodies"
        fill
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 flex items-end justify-center bg-black/15 pb-[60px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-[clamp(28px,5vw,52px)] uppercase leading-none text-white">
            HOODIES
          </h2>
          <p className="text-[15px] text-white">13 Products</p>
          <button className="h-12 cursor-pointer rounded-full border border-white bg-transparent px-[30px] text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black max-[360px]:h-8 max-[360px]:px-4 max-[360px]:text-[12px]">
            SHOP NOW
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <Dots tone="light" />
      </div>
    </section>
  );
}
