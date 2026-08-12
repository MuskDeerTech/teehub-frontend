"use client";

import Image from "next/image";
import Link from "next/link";
import { fitTransform, menuCollections, type Category } from "@/lib/products";

type MegaMenuProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  loading?: boolean;
};

export default function MegaMenu({
  open,
  onClose,
  categories,
  loading = false,
}: MegaMenuProps) {
  if (!open) return null;

  return (
    <>
      {/* Click-away overlay below the navbar */}
      <div
        className="fixed inset-0 top-[72px] z-[90] bg-black/20 max-[1024px]:top-[76px]"
        onClick={onClose}
      />

      {/* Dropdown panel */}
      <div className="absolute left-0 right-0 top-full z-[95] origin-top rounded-b-[20px] border-b border-[#e7e7e7] bg-white px-8 py-5 shadow-[0_24px_40px_rgba(0,0,0,0.12)] max-[768px]:px-5">
        <div className="flex items-start gap-20 max-[1024px]:flex-col">
          {/* LEFT — collection links */}
          <div className="flex w-[260px] shrink-0 flex-col gap-4 max-[1024px]:w-full">
            {menuCollections.map((item) =>
              item === "NEW ARRIVALS" ? (
                <Link
                  key={item}
                  href="/new-in"
                  onClick={onClose}
                  className="text-[14px] font-bold uppercase tracking-[1px] text-black transition-colors duration-200 hover:text-[#ff5b1f]"
                >
                  {item}
                </Link>
              ) : (
                <span
                  key={item}
                  className="cursor-pointer text-[14px] font-bold uppercase tracking-[1px] text-black transition-colors duration-200 hover:text-[#ff5b1f]"
                >
                  {item}
                </span>
              ),
            )}
          </div>

          {/* RIGHT — category tiles.
              Stays a grid at every width and the tiles are fluid (capped at
              their 104px design size), so the column count is a deliberate
              choice rather than "whatever fits". It used to wrap fixed-width
              tiles, which needed a 392px viewport to fit three — so a 390px
              iPhone silently dropped to two per row with a dead gutter, while
              a 393px one squeaked in at three. */}
          <div className="grid flex-1 grid-cols-6 justify-items-center gap-x-5 gap-y-7 max-[1024px]:w-full max-[1024px]:gap-y-8 max-[768px]:grid-cols-4 max-[560px]:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex w-full max-w-[104px] flex-col items-center gap-3"
                  >
                    <span className="h-[4px] w-full max-w-[90px] rounded bg-[#eeeeee]" />
                    <span className="aspect-square w-full rounded-[10px] bg-[#eeeeee]" />
                  </div>
                ))
              : categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="flex w-full max-w-[104px] cursor-pointer flex-col items-center gap-[15px]"
                  >
                    <span className="whitespace-nowrap text-center text-[12px] font-bold uppercase tracking-[0.4px] text-black">
                      {cat.label}
                    </span>
                    {/* Fixed tile: CMS-controlled `bg` colour fills the box, the
                        transparent cutout thumbnail sits on top (object-contain).
                        Falls back to the label when no image is set. */}
                    <span
                      style={{ backgroundColor: cat.bg ?? "#f1f1f1" }}
                      className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[10px] transition-transform duration-300 hover:scale-105"
                    >
                      {cat.thumbnailImage ? (
                        <Image
                          src={cat.thumbnailImage.src}
                          alt={cat.thumbnailImage.alt}
                          width={104}
                          height={104}
                          className="h-full w-full object-contain"
                          // Replays the drag/zoom fit set in the admin editor;
                          // overflow is clipped by the rounded tile above.
                          style={fitTransform(cat.thumbFit)}
                        />
                      ) : (
                        <span className="px-2 text-center text-[11px] font-bold uppercase tracking-[0.4px] text-[#777]">
                          {cat.label}
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </>
  );
}
