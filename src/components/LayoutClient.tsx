"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide Header & Footer for login/signup pages
  const hideLayout =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/auth");

  return (
    <>
      {!hideLayout && <Header />}
      {children}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        theme="colored"
      />
      {!hideLayout && <Footer />}
    </>
  );
}
