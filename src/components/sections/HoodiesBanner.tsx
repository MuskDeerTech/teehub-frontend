import Image from "next/image";
import Dots from "@/components/ui/Dots";

export default function HoodiesBanner() {
  return (
    <section className="relative min-h-[420px] w-full overflow-hidden sm:min-h-[550px] lg:min-h-[720px]">
      <Image
        src="/images/hoodiesbanner.png"
        alt="Hoodies"
        fill
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 flex items-end justify-center bg-black/15 px-4 pb-10 sm:pb-12 lg:pb-[60px]">
        <div className="flex flex-col items-center gap-2.5 text-center sm:gap-3 lg:gap-4">
          <h2 className="text-[clamp(28px,5vw,52px)] uppercase leading-none text-white">
            HOODIES
          </h2>
          <p className="text-[13px] text-white sm:text-[15px]">13 Products</p>
          <button className="h-9 cursor-pointer rounded-full border border-white bg-transparent px-5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black sm:h-11 sm:px-7 sm:text-[15px] lg:h-12 lg:px-[30px] lg:text-[16px]">
            SHOP NOW
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 sm:bottom-5 lg:bottom-6">
        <Dots tone="light" />
      </div>
    </section>
  );
}