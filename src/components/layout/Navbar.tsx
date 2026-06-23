"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [authOpen, setAuthOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

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
      <nav className="flex h-[72px] w-full items-center justify-between border-b border-[#e7e7e7] bg-[#f8f8f8] px-[42px] max-[768px]:px-5 max-[360px]:h-[70px] max-[360px]:justify-center max-[360px]:px-0">
      <div className="flex items-center gap-[34px] max-[768px]:flex-1 max-[768px]:justify-start max-[768px]:gap-[15px] max-[360px]:hidden">
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
        className="absolute left-1/2 -translate-x-1/2 max-[768px]:left-[55%]"
      >
        <Image
          src="/images/teehub-logo.png"
          alt="TeeHub Logo"
          width={181}
          height={57}
          priority
          className="h-[52px] w-auto"
        />
      </Link>

      {/* ICONS */}
      <div className="flex items-center gap-7 max-[768px]:flex-1 max-[768px]:justify-end max-[768px]:gap-5 max-[360px]:hidden">
        {/* LOCATION */}
        <span
          onMouseEnter={() => setCollectionsOpen(false)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center"
        >
          <IconMapPin size={26} stroke={1.5} className="text-black" />
        </span>

        {/* SEARCH */}
        <span
          onMouseEnter={() => setCollectionsOpen(false)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center"
        >
          <IconSearch size={26} stroke={1.5} className="text-black" />
        </span>

        {/* PROFILE */}
        <button
          type="button"
          aria-label={user ? "Account" : "Sign in"}
          onClick={() => (user ? router.push("/account") : setAuthOpen(true))}
          onMouseEnter={() => setCollectionsOpen(false)}
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center"
        >
          <IconUser
            size={26}
            stroke={1.5}
            className={user ? "text-[#f36d43]" : "text-black"}
          />
        </button>

        {/* INSTAGRAM */}
        <span
          onMouseEnter={() => setCollectionsOpen(false)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center"
        >
          <IconBrandInstagram size={26} stroke={1.5} className="text-black " />
        </span>

        {/* BAG */}
        <button
          type="button"
          aria-label={`Open cart (${totalCount} items)`}
          onClick={openCart}
          onMouseEnter={() => setCollectionsOpen(false)}
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center"
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
      </nav>

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
