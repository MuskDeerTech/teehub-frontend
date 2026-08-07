import type { Metadata } from "next";
import { Inter, Anton_SC, Bebas_Neue, Roboto } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomBanner from "@/components/layout/BottomBanner";
import { BookmarksProvider } from "@/components/providers/BookmarksProvider";
import { SearchProvider } from "@/components/providers/SearchProvider";
import { CartProvider } from "@/components/cart/CartContext";
import { AuthProvider } from "@/components/auth/AuthContext";
import CartRoot from "@/components/cart/CartRoot";
import { SITE_URL } from "@/lib/seo";
import { getPopularSearches } from "@/lib/search";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const anton = Anton_SC({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
// Display face for the /reviews hero headline; Roboto carries reviewer names.
const bebas = Bebas_Neue({ variable: "--font-bebas-neue", weight: "400", subsets: ["latin"] });
const roboto = Roboto({ variable: "--font-roboto-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  // Resolves relative canonical/OG URLs to absolute ones against the live host.
  metadataBase: new URL(SITE_URL),
  title: "TeeHub - Premium Sports Jerseys, Hoodies & Polos",
  description: "Shop IPL jerseys, football hoodies, jackets and polo t-shirts at TeeHub.",
};

export default async function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const popularSearches = await getPopularSearches();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} ${bebas.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans" suppressHydrationWarning>
        <AuthProvider>
          <BookmarksProvider>
            <CartProvider>
              <SearchProvider popularSearches={popularSearches}>
                <div className="w-full min-h-screen overflow-x-clip">
                  <Navbar />
                  {children}
                  <Footer />
                  <BottomBanner />
                  <CartRoot />
                </div>
              </SearchProvider>
            </CartProvider>
          </BookmarksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}