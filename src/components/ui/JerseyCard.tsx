import Image from "next/image";
import type { JerseyDrop } from "@/lib/products";

/** Product card used in the "Latest Drops" section (colored box + price range). */
export default function JerseyCard({ drop }: { drop: JerseyDrop }) {
  return (
    <div className="group w-full max-[1024px]:w-[calc(50%_-_10px)] max-[1024px]:shrink-0 max-[1024px]:snap-start max-[480px]:w-[80%] max-[360px]:h-[460px] max-[360px]:w-full">
      <div
        className={`relative flex h-[468px] w-[313px] items-end justify-center overflow-hidden rounded-[10px] ${drop.bg} max-[1024px]:top-[20px] max-[1024px]:h-[500px] max-[1024px]:w-[90%] max-[768px]:h-[420px] max-[768px]:w-full max-[360px]:mt-[-66px] max-[360px]:h-[90%] max-[360px]:w-full`}
      >
        <Image
          src={drop.image}
          alt={drop.alt}
          width={313}
          height={468}
          className="h-full w-full object-contain object-top transition-transform duration-300 group-hover:scale-105 max-[1024px]:absolute max-[1024px]:left-[-1px] max-[1024px]:top-[30px] max-[1024px]:h-[500px] max-[1024px]:w-[500%] max-[1024px]:object-cover max-[1024px]:object-bottom max-[768px]:relative max-[768px]:left-[-1px] max-[768px]:top-[50px] max-[768px]:h-full max-[768px]:w-full"
        />
      </div>

      <div className="pt-2.5">
        <h3 className="line-clamp-2 min-h-[calc(1.3em*2)] overflow-hidden text-[18px] font-normal leading-[1.3] text-black min-[1440px]:mt-5 min-[1440px]:line-clamp-3 min-[1440px]:text-[25px] min-[1440px]:font-bold min-[1440px]:leading-[1.4] max-[1024px]:mt-[30px] max-[1024px]:line-clamp-3 max-[1024px]:text-[25px] max-[1024px]:font-bold max-[1024px]:leading-[1.4] max-[768px]:text-[18px] max-[360px]:text-[15px]">
          {drop.title}
        </h3>
        <div className="flex items-center justify-between min-[1440px]:pt-5 max-[768px]:text-[10px]">
          <span className="mt-[-15px] text-[18px] text-[#444] min-[1440px]:text-[20px]">
            {drop.price}
          </span>
          <button className="mt-[-15px] w-10 cursor-pointer text-[30px] text-[#111]">
            +
          </button>
        </div>
      </div>
    </div>
  );
}
