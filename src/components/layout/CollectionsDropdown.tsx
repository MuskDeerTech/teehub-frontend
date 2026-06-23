"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Category } from "@/lib/products";

/** IPL thumbnail is the reference — other categories get a small uniform boost. */
const REFERENCE_THUMB_SLUG = "ipl-jersey";
const THUMB_BOOST = 1.08;

function collectionThumbStyle(slug: string): CSSProperties | undefined {
  if (slug === REFERENCE_THUMB_SLUG) return undefined;
  return {
    transform: `scale(${THUMB_BOOST})`,
    transformOrigin: "bottom center",
  };
}

/** White card on the grey dropdown; CMS default grey is treated as unset here. */
function collectionTileBg(bg?: string): string {
  if (!bg || bg.toLowerCase() === "#f1f1f1") return "#ffffff";
  return bg;
}

type CollectionsDropdownProps = {
  open: boolean;
  categories: Category[];
  loading?: boolean;
  onClose: () => void;
};

const tileClass =
  "flex w-[132px] shrink-0 flex-col items-center gap-3 max-[768px]:w-[116px] max-[480px]:w-[104px]";

const imageBoxClass =
  "relative block overflow-hidden rounded-[14px] h-[168px] w-[132px] max-[768px]:h-[150px] max-[768px]:w-[116px] max-[480px]:h-[136px] max-[480px]:w-[104px]";

export default function CollectionsDropdown({
  open,
  categories,
  loading = false,
  onClose,
}: CollectionsDropdownProps) {
  if (!open) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-[95] border-b border-[#e7e7e7] bg-[#f3f3f3] shadow-[0_20px_36px_rgba(0,0,0,0.1)]">
      {/* Same horizontal padding as the navbar — aligns with NEW IN and hamburger */}
      <div className="px-[42px] py-6 max-[768px]:px-5 max-[360px]:px-4">
        <div className="flex w-full items-start justify-between max-[1100px]:scrollbar-hide max-[1100px]:justify-start max-[1100px]:gap-5 max-[1100px]:overflow-x-auto">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={tileClass}>
                  <span className={`${imageBoxClass} bg-[#e4e4e4]`} />
                  <span className="h-3 w-20 rounded bg-[#e4e4e4]" />
                </div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className={`group ${tileClass}`}
                >
                  <span
                    style={{ backgroundColor: collectionTileBg(cat.bg) }}
                    className={`${imageBoxClass} ${
                      cat.thumbnailImage
                        ? ""
                        : "flex items-center justify-center"
                    } transition-transform duration-300 group-hover:scale-[1.02]`}
                  >
                    {cat.thumbnailImage ? (
                      <span className="absolute inset-x-0 bottom-0 h-[92%]">
                        <Image
                          src={cat.thumbnailImage.src}
                          alt={cat.thumbnailImage.alt}
                          fill
                          sizes="(max-width: 480px) 104px, (max-width: 768px) 116px, 132px"
                          className="object-contain object-bottom"
                          style={collectionThumbStyle(cat.slug)}
                        />
                      </span>
                    ) : (
                      <span className="px-2 text-center text-[11px] font-bold uppercase tracking-[0.4px] text-[#777]">
                        {cat.label}
                      </span>
                    )}
                  </span>
                  <span className="w-full text-center text-[12px] font-bold uppercase leading-tight tracking-[0.4px] text-black max-[480px]:text-[11px]">
                    {cat.label}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}
