"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface Category {
  id: string;
  name: string;
  parent?: string | null;
}

interface User {
  uid: string;
  phone: string;
  name?: string;
  address?: string;
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const { cartCount, wishlist, wishlistCount } = useCart();
  const isWishlistNotEmpty = wishlist.length > 0;

  // ✅ Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ✅ Fetch categories dynamically from Payload
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories?depth=0`);
        const data = await res.json();
        setCategories(data.docs || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="bg-[#E7E1E1] border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-2 py-3">
          {/* --- Logo Row --- */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/teehub_logo.png"
                alt="TeeHub Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>

            {/* ✅ Account or Login */}
            {!user ? (
              <Link
                href="/login"
                className="hidden lg:flex items-center gap-2 text-sm font-bold text-gray-800"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="20" cy="20" r="18" stroke="black" strokeWidth="2" />
                  <path
                    d="M20 20C23 20 25 17.5 25 15C25 12.5 23 10 20 10C17 10 15 12.5 15 15C15 17.5 17 20 20 20Z"
                    fill="black"
                  />
                  <path d="M10 30C10 25 30 25 30 30" stroke="black" strokeWidth="2" />
                </svg>
                <span>Login</span>
              </Link>
            ) : (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 font-bold text-gray-800"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="20" cy="20" r="18" stroke="black" strokeWidth="2" />
                    <path
                      d="M20 20C23 20 25 17.5 25 15C25 12.5 23 10 20 10C17 10 15 12.5 15 15C15 17.5 17 20 20 20Z"
                      fill="black"
                    />
                    <path d="M10 30C10 25 30 25 30 30" stroke="black" strokeWidth="2" />
                  </svg>
                  <span>Account</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg z-50">
                    <div className="px-4 py-2 border-b text-sm text-gray-800 font-medium">
                      {user?.name || "My Account"}
                      <p className="text-xs text-gray-500">{user?.phone}</p>
                    </div>
                    <Link href="/account/orders" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                      My Orders
                    </Link>
                    <Link href="/account/addresses" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                      Saved Addresses
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* --- Mobile hamburger --- */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <rect width="24" height="2" rx="1" fill="black" />
                <rect y="7" width="24" height="2" rx="1" fill="black" />
                <rect y="14" width="24" height="2" rx="1" fill="black" />
              </svg>
            </button>
          </div>

          {/* --- Nav, Search, Icons --- */}
          <div className="flex items-center justify-between gap-4">
            {/* ✅ Dynamic Nav */}
            <nav className="hidden lg:flex gap-6">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.name.toLowerCase()}`}
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))
              ) : (
                <span className="text-gray-400 text-sm">Loading...</span>
              )}
            </nav>

            {/* Search */}
            <div className="w-full max-w-xl">
              <form role="search" className="w-full">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="What are you looking for?"
                    className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-200 transition-all"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2">
                <svg
                  width="22"
                  height="18"
                  viewBox="0 0 32 28"
                  fill={isWishlistNotEmpty ? "black" : "none"}
                  stroke={isWishlistNotEmpty ? "black" : "currentColor"}
                >
                  <path
                    d="M9.43734 1.33399C5.00765 1.33399 1.4165 4.92513 1.4165 9.35482C1.4165 17.3757 10.8957 24.6673 15.9998 26.3634C21.104 24.6673 30.5832 17.3757 30.5832 9.35482C30.5832 4.92513 26.992 1.33399 22.5623 1.33399C19.8498 1.33399 17.4509 2.68076 15.9998 4.74211C15.2601 3.68875 14.2775 2.82907 13.1352 2.23584C11.9929 1.6426 10.7245 1.33326 9.43734 1.33399Z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-0.5 text-xs bg-red-600 text-white rounded-full px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M30.7693 8.29479C30.6324 8.13679 30.463 8.01009 30.2728 7.92329..."
                    fill="black"
                  />
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
      </div>
    </header>
  );
}
