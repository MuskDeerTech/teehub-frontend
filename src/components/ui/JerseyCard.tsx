import Image from "next/image";
import Link from "next/link";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { jerseyBookmarkId } from "@/lib/bookmarks";
import type { JerseyDrop } from "@/lib/products";

export default function JerseyCard({
  drop,
  compact = false,
  bgColor,
  href,
}: {
  drop: JerseyDrop;
  compact?: boolean;
  bgColor?: string;
  href?: string;
}) {
  return (
    <div className="group w-full max-[1024px]:w-[calc(50%_-_10px)] max-[1024px]:shrink-0 max-[1024px]:snap-start max-[480px]:w-[80%] max-[360px]:h-[460px] max-[360px]:w-full">
      <div
        className={`relative flex items-end justify-center overflow-hidden rounded-[10px] ${
          bgColor ? "" : drop.bg
        } ${
          compact
            ? "h-[350px] w-[330px] max-[768px]:h-[280px]"
            : "h-[500px] w-[330px] max-[1024px]:top-[20px] max-[1024px]:h-[500px] max-[1024px]:w-[90%] max-[768px]:h-[420px] max-[768px]:w-full max-[360px]:mt-[-66px] max-[360px]:h-[90%] max-[360px]:w-full"
        }`}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <BookmarkButton
          id={jerseyBookmarkId(drop.title)}
          className="absolute right-3 top-3 z-10 text-white/95 drop-shadow transition-transform duration-200 hover:scale-110"
        />

        <Image
          src={drop.image}
          alt={drop.alt}
          width={compact ? 260 : 330}
          height={compact ? 340 : 500}
          className={`transition-transform duration-300 group-hover:scale-105 ${
            compact
              ? "h-full w-full object-cover object-top"
              : "h-full w-full object-cover object-top max-[1024px]:absolute max-[1024px]:left-[-1px] max-[1024px]:top-[30px] max-[1024px]:h-[500px] max-[1024px]:w-[500%] max-[1024px]:object-cover max-[1024px]:object-bottom max-[768px]:relative max-[768px]:left-[-1px] max-[768px]:top-[50px] max-[768px]:h-full max-[768px]:w-full"
          }`}
        />
      </div>

      <div className="pt-2.5">
        <h3
          className={`line-clamp-2 overflow-hidden leading-[1.3] text-black ${
            compact
              ? "text-[15px] font-semibold"
              : "min-h-[calc(1.3em*2)] text-[18px] font-normal min-[1440px]:mt-5 min-[1440px]:line-clamp-3 min-[1440px]:text-[18px] min-[1440px]:font-bold min-[1440px]:leading-[1.4] max-[1024px]:mt-[30px] max-[1024px]:line-clamp-3 max-[1024px]:text-[25px] max-[1024px]:font-bold max-[1024px]:leading-[1.4] max-[768px]:text-[18px] max-[360px]:text-[15px]"
          }`}
        >
          {href ? (
            <Link
              href={href}
              className="hover:text-[#f36d43] transition-colors"
            >
              {drop.title}
            </Link>
          ) : (
            drop.title
          )}
        </h3>
        <div
          className={`flex items-center justify-between ${compact ? "mt-1" : "min-[1440px]:pt-5"} max-[768px]:text-[10px]`}
        >
          <span
            className={`text-[#444] ${compact ? "text-[14px]" : "mt-[-30px] text-[18px] min-[1440px]:text-[15px]"}`}
          >
            {drop.price}
          </span>
         {/* <button
            className={`cursor-pointer text-[#111] ${compact ? "text-[24px]" : "mt-[-30px] w-5 text-[30px]"}`}
          >
            +
          </button>*/}
        </div>
      </div>
    </div>
  );
}
