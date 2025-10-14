// D:\teehub-frontend\src\app\layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import LayoutClient from "@/components/LayoutClient";

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
        <LayoutClient>{children}</LayoutClient>
        </CartProvider>
      </body>
    </html>
  );
}
