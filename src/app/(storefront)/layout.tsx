import type { Metadata } from "next";
import { Inter, Anton_SC } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomBanner from "@/components/layout/BottomBanner";
import { BookmarksProvider } from "@/components/providers/BookmarksProvider";
import { CartProvider } from "@/components/cart/CartContext";
import { AuthProvider } from "@/components/auth/AuthContext";
import CartRoot from "@/components/cart/CartRoot";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const anton = Anton_SC({ variable: "--font-anton", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TeeHub - Premium Sports Jerseys, Hoodies & Polos",
  description: "Shop IPL jerseys, football hoodies, jackets and polo t-shirts at TeeHub.",
};

export default function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} h-full antialiased`}>
      <body className="min-h-full font-sans" suppressHydrationWarning>
        <AuthProvider>
          <BookmarksProvider>
            <CartProvider>
              <div className="w-full min-h-screen overflow-x-clip">
                <Navbar />
                {children}
                <Footer />
                <BottomBanner />
                <CartRoot />
              </div>
            </CartProvider>
          </BookmarksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}