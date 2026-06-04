"use client";

import Image from "next/image";
import Link from "next/link";
import { menuCollections, menuCategories } from "@/lib/products";

type MegaMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MegaMenu({ open, onClose }: MegaMenuProps) {
  if (!open) return null;

  return (
    <>
      {/* Click-away overlay below the navbar */}
      <div
        className="fixed inset-0 top-[72px] z-[90] bg-black/20 max-[360px]:top-[70px]"
        onClick={onClose}
      />

      {/* Dropdown panel */}
      <div className="absolute left-0 right-0 top-full z-[95] origin-top rounded-b-[20px] border-b border-[#e7e7e7] bg-white px-8 py-5 shadow-[0_24px_40px_rgba(0,0,0,0.12)] max-[768px]:px-5">
        <div className="flex items-start gap-20 max-[1024px]:flex-col">
          {/* LEFT — collection links */}
          <div className="flex w-[260px] shrink-0 flex-col gap-4 max-[1024px]:w-full">
            {menuCollections.map((item) => (
              <span
                key={item}
                className="cursor-pointer text-[14px] font-bold uppercase tracking-[1px] text-black transition-colors duration-200 hover:text-[#ff5b1f]"
              >
                {item}
              </span>
            ))}
          </div>

          {/* RIGHT — category tiles */}
          <div className="grid flex-1 grid-cols-6 justify-items-center gap-x-10 max-[1024px]:flex max-[1024px]:flex-wrap max-[1024px]:justify-start">
            {menuCategories.map((cat) => (
              <Link
                key={cat.title}
                href={`/category/${cat.slug}`}
                onClick={onClose}
                className="flex w-[104px] cursor-pointer flex-col items-center gap-[35px]"
              >
                <span className="whitespace-nowrap text-center text-[12px] font-bold uppercase tracking-[0.4px] text-black">
                  {cat.title}
                </span>
                <Image
                  src={cat.image}
                  alt={cat.title}
                  width={104}
                  height={104}
                  className="h-[104px] w-[104px] object-contain transition-transform duration-300 hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
