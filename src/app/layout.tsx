import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import LayoutClient from "@/components/LayoutClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthListener from "@/components/AuthListener"; // 👈 add this line

export const metadata: Metadata = {
  title: "TeeHub - Ties From Town",
  description: "Explore the latest collection of ties at TeeHub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AuthListener /> {/* 👈 add here */}
          <LayoutClient>{children}</LayoutClient>
        </CartProvider>
        <ToastContainer position="top-center" autoClose={2000} />
      </body>
    </html>
  );
}
