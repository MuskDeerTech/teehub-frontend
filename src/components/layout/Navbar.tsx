"use client";

import Image from "next/image";
import { useState } from "react";
import { navLinks } from "@/lib/products";
import MegaMenu from "@/components/layout/MegaMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative z-[100] flex h-[72px] w-full items-center justify-between border-b border-[#e7e7e7] bg-[#f8f8f8] px-[42px] max-[768px]:px-5 max-[360px]:h-[70px] max-[360px]:justify-center max-[360px]:px-0">
      <div className="flex items-center gap-[34px] max-[768px]:flex-1 max-[768px]:justify-start max-[768px]:gap-[15px] max-[360px]:hidden">
        {navLinks.map((link) => (
          <span
            key={link}
            className="cursor-pointer text-[13px] font-bold tracking-[1px] text-black transition-colors duration-200 hover:text-[#ff5b1f]"
          >
            {link}
          </span>
        ))}
      </div>

      {/* LOGO */}
      <div className="absolute left-1/2 -translate-x-1/2 max-[768px]:left-[55%]">
        <Image
          src="/images/teehub-logo.png"
          alt="TeeHub Logo"
          width={181}
          height={57}
          priority
          className="h-[52px] w-auto"
        />
      </div>

      {/* ICONS */}
      <div className="flex items-center gap-7 max-[768px]:flex-1 max-[768px]:justify-end max-[768px]:gap-5 max-[360px]:hidden">
        <span className="flex h-7 w-7 cursor-pointer items-center justify-center">
          <Image
            src="/svg/icons/location.svg"
            alt="Location"
            width={17}
            height={29}
            className="h-auto max-h-full w-auto max-w-full object-contain"
          />
        </span>
        <span className="flex h-7 w-7 cursor-pointer items-center justify-center">
          <Image
            src="/svg/icons/search.svg"
            alt="Search"
            width={28}
            height={23}
            className="h-auto max-h-full w-auto max-w-full object-contain"
          />
        </span>
        <span className="flex h-7 w-7 cursor-pointer items-center justify-center">
          <Image
            src="/svg/icons/profile.svg"
            alt="Profile"
            width={17}
            height={29}
            className="h-auto max-h-full w-auto max-w-full object-contain"
          />
        </span>
        <span className="flex h-7 w-7 cursor-pointer items-center justify-center">
          <Image
            src="/svg/icons/instagram.svg"
            alt="Instagram"
            width={35}
            height={26}
            className="h-auto max-h-full w-auto max-w-full object-contain"
          />
        </span>
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-7 w-11 cursor-pointer items-center justify-center"
        >
          <Image
            src="/svg/icons/hamburg.svg"
            alt="Menu"
            width={56}
            height={35}
            className="h-auto max-h-full w-auto max-w-full object-contain"
          />
        </button>
      </div>

      <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </nav>
  );
}
