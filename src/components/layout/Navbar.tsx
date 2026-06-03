import {
  MapPin,
  Search,
  Instagram,
  User,
  AlignJustify,
} from "@deemlol/next-icons";
import Image from "next/image";
import { navLinks } from "@/lib/products";

export default function Navbar() {
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
      <div className="flex items-center gap-4 max-[768px]:flex-1 max-[768px]:justify-end max-[768px]:gap-3 max-[360px]:hidden">
        <MapPin color="#717171" width={16.89} height={28.8} opacity={80} />
        <Search color="#717171" width={28} height={23} opacity={80} />
        <User color="#717171" width={16.89} height={28.8} opacity={80} />
        <Instagram color="#717171" width={34.22} height={25} opacity={80} />
        <AlignJustify
          color="#717171"
          width={55.97}
          height={34.55}
          opacity={80}
        />
      </div>
    </nav>
  );
}
