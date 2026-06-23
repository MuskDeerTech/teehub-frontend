import Image from "next/image";
import Link from "next/link";
import BookmarkButton from "@/components/ui/BookmarkButton";
import { jerseyBookmarkId } from "@/lib/bookmarks";
import type { JerseyDrop } from "@/lib/products";

const config = {
  normal: {
    image: {
      aspect: "aspect-[330/500]",
      aspectSm: "sm:aspect-[330/480]",
      aspectLg: "lg:aspect-[330/500]",
      position: "object-top",     
      zoom: "scale-100",
      rounded: "rounded-[10px]",
    },
    bookmark: {
      position: "right-3 top-3", 
    },
    gapImageToText: "pt-2.5",
    gapTitleToPrice: "mt-1.5",
    title: {
      size: "text-[16px]",
      sizeSm: "sm:text-[18px]",
      size1440: "min-[1440px]:text-[18px]",
      weight: "font-bold",
      weight1440: "min-[1440px]:font-bold",
      lines: "line-clamp-2",
    },
    price: {
      size: "text-[15px]",
      sizeSm: "sm:text-[18px]",
      size1440: "min-[1440px]:text-[15px]",
    },
  },
  compact: {
    image: {
      aspect: "aspect-[330/350]",
      aspectSm: "sm:aspect-[330/350]",
      aspectLg: "lg:aspect-[330/350]",
      position: "object-top",
      zoom: "scale-100",
      rounded: "rounded-[10px]",
    },
    bookmark: {
      position: "right-3 top-3",
    },
    gapImageToText: "pt-2.5",
    gapTitleToPrice: "mt-1",
    title: {
      size: "text-[15px]",
      sizeSm: "sm:text-[15px]",
      size1440: "min-[1440px]:text-[15px]",
      weight: "font-semibold",
      weight1440: "",
      lines: "line-clamp-2",
    },
    price: {
      size: "text-[14px]",
      sizeSm: "sm:text-[14px]",
      size1440: "min-[1440px]:text-[14px]",
    },
  },
} as const;

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
  const c = compact ? config.compact : config.normal;

  return (
    <div className="group flex w-full flex-col">
      {/* IMAGE */}
      <div
        className={[
          "relative w-full overflow-hidden",
          c.image.rounded,
          c.image.aspect,
          c.image.aspectSm,
          c.image.aspectLg,
          bgColor ? "" : drop.bg,
        ].join(" ")}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <BookmarkButton
          id={jerseyBookmarkId(drop.title)}
          className={`absolute z-10 text-white/95 drop-shadow transition-transform duration-200 hover:scale-110 ${c.bookmark.position}`}
        />

        <Image
          src={drop.image}
          alt={drop.alt}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
          className={[
            "object-cover transition-transform duration-300",
            c.image.position,
            c.image.zoom,
            "group-hover:scale-105",
          ].join(" ")}
        />
      </div>

      {/* TEXT BLOCK */}
      <div className={`flex flex-1 flex-col ${c.gapImageToText}`}>
        <h3
          className={[
            "min-h-[calc(1.3em*2)] leading-[1.3] text-black",
            c.title.lines,
            c.title.size,
            c.title.sizeSm,
            c.title.size1440,
            c.title.weight,
            c.title.weight1440,
          ].join(" ")}
        >
          {href ? (
            <Link href={href} className="transition-colors hover:text-[#f36d43]">
              {drop.title}
            </Link>
          ) : (
            drop.title
          )}
        </h3>

        <div className={`flex items-center justify-between ${c.gapTitleToPrice}`}>
          <span className={`text-[#444] ${c.price.size} ${c.price.sizeSm} ${c.price.size1440}`}>
            {drop.price}
          </span>
        </div>
      </div>
    </div>
  );
}