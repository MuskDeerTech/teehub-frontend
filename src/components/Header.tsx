"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext"; // Import useCart
const navItems = ["Cricket", "IPL", "Football", "Movie", "Purpose"];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, wishlist } = useCart(); // Use cartCount and wishlist from CartContext

  // Determine if wishlist is not empty to apply red fill
  const isWishlistNotEmpty = wishlist.length > 0;

  return (
    <header className="bg-[#E7E1E1] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-2 py-3">
          {/* Row 1: Logo and Sign-in (Desktop only, full width on mobile) */}
          <div className="col-span-3 lg:col-span-1 lg:row-span-1 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/teehub_logo.png"
                alt="TeeHub Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
            <Link
              href="/account"
              className="hidden lg:flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-90"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 21c0-3 4-5 9-5s9 2 9 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Sign in / Register</span>
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="2" rx="1" fill="black" />
                <rect y="7" width="24" height="2" rx="1" fill="black" />
                <rect y="14" width="24" height="2" rx="1" fill="black" />
              </svg>
            </button>
          </div>

          {/* Row 2: Nav, Search, and Icons */}
          <div className="col-span-3 lg:col-span-1 lg:row-span-1 flex items-center justify-between gap-4">
            {/* Desktop nav */}
            <nav className="hidden lg:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={`/category/${item.toLowerCase()}`}
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <div className="w-full max-w-xl">
              <form role="search" className="w-full">
                <label htmlFor="site-search" className="sr-only">
                  Search products
                </label>
                <div className="relative">
                  <input
                    id="site-search"
                    name="q"
                    type="search"
                    placeholder="What are you looking for?"
                    className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-200 transition-all"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 21L16.65 16.65"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="11"
                        cy="11"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-3">
              <Link
                href="/wishlist"
                className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isWishlistNotEmpty ? "red" : "none"} // Red fill when wishlist is not empty
                  stroke={isWishlistNotEmpty ? "red" : "currentColor"}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6h15l-1.5 9h-11L6 6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="20" r="1" fill="currentColor" />
                  <circle cx="18" cy="20" r="1" fill="currentColor" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-0.5 text-xs bg-red-600 text-white rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE nav panel */}
        {mobileOpen && (
          <div className="md:hidden bg-[#E7E1E1] py-2 px-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={`/category/${item.toLowerCase()}`}
                  className="py-2 px-3 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link
                href="/account"
                className="py-2 px-3 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Sign in / Register
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}