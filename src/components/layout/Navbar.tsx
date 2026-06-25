"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  IconUser,
  IconSearch,
  IconMapPin,
  IconShoppingBag,
  IconBrandInstagram,
} from "@tabler/icons-react";
import { navLinks, type Category } from "@/lib/products";
import MegaMenu from "@/components/layout/MegaMenu";
import CollectionsDropdown from "@/components/layout/CollectionsDropdown";
import SearchOverlay from "@/components/layout/SearchOverlay";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/components/auth/AuthContext";
import { useCart } from "@/components/cart/CartContext";

type PayloadMedia = { url?: string | null; alt?: string | null };
type PayloadCategory = {
  name: string;
  slug: string;
  bg?: string | null;
  thumbnailImage?: number | PayloadMedia | null;
  thumbFit?: {
    scale?: number | null;
    x?: number | null;
    y?: number | null;
  } | null;
};

function mapCategory(doc: PayloadCategory): Category {
  const thumbnail =
    typeof doc.thumbnailImage === "object" && doc.thumbnailImage !== null
      ? doc.thumbnailImage
      : undefined;
  return {
    slug: doc.slug,
    label: doc.name,
    bg: doc.bg ?? undefined,
    thumbnailImage: thumbnail?.url
      ? { src: thumbnail.url, alt: thumbnail.alt || doc.name }
      : undefined,
    thumbFit: doc.thumbFit
      ? {
          scale: doc.thumbFit.scale ?? undefined,
          x: doc.thumbFit.x ?? undefined,
          y: doc.thumbFit.y ?? undefined,
        }
      : undefined,
  };
}

export default function Navbar() {
  const router = useRouter();
  const { openCart, cartOpen, totalCount } = useCart();
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [mobileDockVisible, setMobileDockVisible] = useState(true);
  const lastScrollY = useRef(0);

  const ensureCategories = () => {
    if (!categoriesLoaded && !categoriesLoading) setCategoriesLoading(true);
  };

  useEffect(() => {
    if ((!menuOpen && !collectionsOpen) || categoriesLoaded || !categoriesLoading)
      return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      "where[isActive][equals]": "true",
      sort: "sortOrder",
      depth: "1",
      limit: "200",
    });
    fetch(`/api/categories?${params.toString()}`, { signal: controller.signal })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Failed")),
      )
      .then((data: { docs?: PayloadCategory[] }) => {
        setCategories((data.docs ?? []).map(mapCategory));
        setCategoriesLoaded(true);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setCategoriesLoaded(true);
      })
      .finally(() => setCategoriesLoading(false));
    return () => controller.abort();
  }, [categoriesLoaded, categoriesLoading, menuOpen, collectionsOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const difference = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 24) {
        setMobileDockVisible(true);
      } else if (difference > 6) {
        setMobileDockVisible(false);
      } else if (difference < -3) {
        setMobileDockVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    if (next) setCollectionsOpen(false);
    if (next) ensureCategories();
  };

  const openCollections = () => {
    setMenuOpen(false);
    setCollectionsOpen(true);
    ensureCategories();
  };

  return (
    <div
      className="sticky top-0 z-[100] relative"
      onMouseLeave={() => setCollectionsOpen(false)}
    >
      <nav className="flex h-[72px] w-full items-center justify-between border-b border-[#e7e7e7] bg-[#f8f8f8] px-[42px] max-[1024px]:h-[76px] max-[1024px]:px-6 max-[480px]:px-4">
      <div className="flex items-center gap-[34px] max-[1024px]:hidden">
        {navLinks.map((link) => {
          if (link === "NEW IN") {
            return (
              <Link
                key={link}
                href="/new-in"
                onMouseEnter={() => setCollectionsOpen(false)}
                className="text-[13px] font-bold tracking-[1px] text-black transition-colors duration-200 hover:text-[#ff5b1f]"
              >
                {link}
              </Link>
            );
          }

          if (link === "COLLECTIONS") {
            return (
              <span
                key={link}
                onMouseEnter={openCollections}
                className="cursor-pointer text-[13px] font-bold tracking-[1px] text-black transition-colors duration-200 hover:text-[#ff5b1f]"
              >
                {link}
              </span>
            );
          }

          return (
            <span
              key={link}
              onMouseEnter={() => setCollectionsOpen(false)}
              className="cursor-pointer text-[13px] font-bold tracking-[1px] text-black transition-colors duration-200 hover:text-[#ff5b1f]"
            >
              {link}
            </span>
          );
        })}
      </div>

      {/* LOGO */}
      <Link
        href="/"
        aria-label="TeeHub home"
        onMouseEnter={() => setCollectionsOpen(false)}
        className="absolute left-1/2 -translate-x-1/2 max-[1024px]:static max-[1024px]:translate-x-0"
      >
        <Image
          src="/images/teehub-logo.png"
          alt="TeeHub Logo"
          width={181}
          height={57}
          priority
          className="h-[52px] w-auto max-[480px]:h-11"
        />
      </Link>

      {/* ICONS */}
      <div className="flex items-center gap-7">
        {/* LOCATION */}
        <a
          href="https://maps.app.goo.gl/c6Nf1VdPwNkn75qV7"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Find our store on Google Maps"
          title="Visit our store — VOC Street, Kumar Nagar, Tiruppur"
          onMouseEnter={() => setCollectionsOpen(false)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center max-[1024px]:hidden"
        >
          <IconMapPin size={26} stroke={1.5} className="text-black" />
        </a>

        {/* SEARCH */}
        <button
          type="button"
          aria-label="Search"
          aria-expanded={searchOpen}
          onClick={() => {
            setCollectionsOpen(false);
            setMenuOpen(false);
            setSearchOpen((v) => !v);
          }}
          onMouseEnter={() => setCollectionsOpen(false)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center max-[1024px]:hidden"
        >
          <IconSearch
            size={26}
            stroke={1.5}
            className={`transition-colors ${searchOpen ? "text-[#f36d43]" : "text-black"}`}
          />
        </button>

        {/* PROFILE */}
        <button
          type="button"
          aria-label={user ? "Account" : "Sign in"}
          onClick={() => (user ? router.push("/account") : setAuthOpen(true))}
          onMouseEnter={() => setCollectionsOpen(false)}
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center max-[1024px]:hidden"
        >
          <IconUser
            size={26}
            stroke={1.5}
            className={user ? "text-[#f36d43]" : "text-black"}
          />
        </button>

        {/* INSTAGRAM */}
        <a
          href="https://www.instagram.com/tee_hub_shop/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TeeHub on Instagram"
          title="Follow us on Instagram"
          onMouseEnter={() => setCollectionsOpen(false)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center max-[1024px]:hidden"
        >
          <IconBrandInstagram size={26} stroke={1.5} className="text-black " />
        </a>

        {/* BAG */}
        <button
          type="button"
          aria-label={`Open cart (${totalCount} items)`}
          onClick={openCart}
          onMouseEnter={() => setCollectionsOpen(false)}
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center max-[1024px]:hidden"
        >
          <IconShoppingBag
            size={26}
            stroke={1.5}
            className={`transition-colors ${cartOpen ? "text-[#f36d43]" : "text-black"}`}
          />
          {totalCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f36d43] text-[9px] font-bold text-white">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </button>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
          onMouseEnter={() => setCollectionsOpen(false)}
          className="flex h-9 w-11 cursor-pointer items-center justify-center max-[1024px]:h-10 max-[1024px]:w-14 max-[1024px]:rounded-full max-[1024px]:bg-[#efefef] max-[480px]:h-10 max-[480px]:w-12"
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
      </nav>

      <div
        aria-label="Mobile navigation"
        className={`fixed left-1/2 z-[110] hidden w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 items-center justify-around rounded-full border border-white/35 bg-[#d9d9d9]/14 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-[14px] transition-all duration-300 max-[1024px]:flex ${
          mobileDockVisible &&
          !menuOpen &&
          !searchOpen &&
          !authOpen &&
          !cartOpen
            ? "bottom-5 translate-y-0 opacity-100"
            : "pointer-events-none bottom-0 translate-y-[130%] opacity-0"
        }`}
      >
        <a
          href="https://maps.app.goo.gl/c6Nf1VdPwNkn75qV7"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Find our store on Google Maps"
          className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
        >
          <IconMapPin size={27} stroke={1.7} />
        </a>

        <button
          type="button"
          aria-label="Search"
          aria-expanded={searchOpen}
          onClick={() => {
            setMenuOpen(false);
            setCollectionsOpen(false);
            setSearchOpen(true);
          }}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
        >
          <IconSearch size={28} stroke={1.7} />
        </button>

        <button
          type="button"
          aria-label={user ? "Account" : "Sign in"}
          onClick={() => (user ? router.push("/account") : setAuthOpen(true))}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
        >
          <IconUser size={28} stroke={1.7} />
        </button>

        <button
          type="button"
          aria-label={`Open cart (${totalCount} items)`}
          onClick={openCart}
          className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
        >
          <IconShoppingBag size={28} stroke={1.7} />
          {totalCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff5b1f] px-1 text-[9px] font-bold text-white">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </button>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <CollectionsDropdown
        open={collectionsOpen}
        categories={categories}
        loading={categoriesLoading && !categoriesLoaded}
        onClose={() => setCollectionsOpen(false)}
      />

      <MegaMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        loading={categoriesLoading && !categoriesLoaded}
      />

      <AuthForm open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
