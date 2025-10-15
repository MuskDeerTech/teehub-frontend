"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const navItems = ["Cricket", "IPL", "Football", "Movie", "Purpose"];
interface User {
  uid: string;
  phone: string;
  name?: string;
  address?: string;
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { cartCount, wishlist, wishlistCount } = useCart();

  const isWishlistNotEmpty = wishlist.length > 0;

  // ✅ Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
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
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="black"
                    strokeWidth="2"
                  />
                  <path
                    d="M20 20C23 20 25 17.5 25 15C25 12.5 23 10 20 10C17 10 15 12.5 15 15C15 17.5 17 20 20 20Z"
                    fill="black"
                  />
                  <path
                    d="M10 30C10 25 30 25 30 30"
                    stroke="black"
                    strokeWidth="2"
                  />
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
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="black"
                      strokeWidth="2"
                    />
                    <path
                      d="M20 20C23 20 25 17.5 25 15C25 12.5 23 10 20 10C17 10 15 12.5 15 15C15 17.5 17 20 20 20Z"
                      fill="black"
                    />
                    <path
                      d="M10 30C10 25 30 25 30 30"
                      stroke="black"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>
                    Account
                  </span>
                  <span>
                     <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20px"
                      height="20px"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
                        fill="#000000"
                      />
                    </svg>
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg z-50">
                    <div className="px-4 py-2 border-b text-sm text-gray-800 font-medium">
                      {user?.name || "My Account"}
                      <p className="text-xs text-gray-500">{user?.phone}</p>
                    </div>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    >
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
            {/* Desktop Nav */}
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
                <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" > <path d="M30.7693 8.29479C30.6324 8.13679 30.463 8.01009 30.2728 7.92329C30.0826 7.83648 29.8759 7.79159 29.6668 7.79167H9.51412L9.22975 6.09417C9.17313 5.75364 8.99756 5.44424 8.73427 5.221C8.47097 4.99776 8.13703 4.87516 7.79183 4.875H4.51058C4.12381 4.875 3.75287 5.02865 3.47938 5.30214C3.20589 5.57563 3.05225 5.94656 3.05225 6.33333C3.05225 6.72011 3.20589 7.09104 3.47938 7.36453C3.75287 7.63802 4.12381 7.79167 4.51058 7.79167H6.55662L9.26912 24.0725L9.33475 24.2533L9.4135 24.4735L9.5885 24.7346L9.72704 24.8979L10.0085 25.0875L10.1718 25.1823C10.3418 25.2521 10.5233 25.2892 10.707 25.2917H26.7502C27.1369 25.2917 27.5079 25.138 27.7814 24.8645C28.0549 24.591 28.2085 24.2201 28.2085 23.8333C28.2085 23.4466 28.0549 23.0756 27.7814 22.8021C27.5079 22.5286 27.1369 22.375 26.7502 22.375H11.9437L11.7016 20.9167H28.2085C28.5594 20.9167 28.8986 20.7902 29.1638 20.5604C29.429 20.3305 29.6024 20.0128 29.6522 19.6654L31.1106 9.45708C31.1403 9.25021 31.1252 9.03936 31.0663 8.83883C31.0075 8.6383 30.9062 8.45276 30.7693 8.29479ZM27.9854 10.7083L27.5697 13.625H22.3752V10.7083H27.9854ZM20.9168 10.7083V13.625H16.5418V10.7083H20.9168ZM20.9168 15.0833V18H16.5418V15.0833H20.9168ZM15.0835 10.7083V13.625H10.7085L10.4927 13.6687L9.99975 10.7083H15.0835ZM10.7289 15.0833H15.0835V18H11.2145L10.7289 15.0833ZM22.3752 18V15.0833H27.3597L26.9441 18H22.3752Z" fill="black" /> <path d="M12.896 31.125C14.1041 31.125 15.0835 30.1456 15.0835 28.9375C15.0835 27.7294 14.1041 26.75 12.896 26.75C11.6879 26.75 10.7085 27.7294 10.7085 28.9375C10.7085 30.1456 11.6879 31.125 12.896 31.125Z" fill="black" /> <path d="M26.021 31.125C27.2291 31.125 28.2085 30.1456 28.2085 28.9375C28.2085 27.7294 27.2291 26.75 26.021 26.75C24.8129 26.75 23.8335 27.7294 23.8335 28.9375C23.8335 30.1456 24.8129 31.125 26.021 31.125Z" fill="black" /> </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-0.5 text-xs bg-red-600 text-white rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* --- Mobile Nav --- */}
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
              {!user ? (
                <Link
                  href="/login"
                  className="py-2 px-3 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              ) : (
                <>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 px-3 hover:bg-gray-100 text-sm"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 px-3 hover:bg-gray-100 text-sm"
                  >
                    Saved Addresses
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="py-2 px-3 text-left hover:bg-gray-100 text-sm text-red-600"
                  >
                    Log Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
