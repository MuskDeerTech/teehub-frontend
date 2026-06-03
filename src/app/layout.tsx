import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomBanner from "@/components/layout/BottomBanner";

// Workhorse UI font — close free substitute for the paid "TT Paplane Trial".
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Heavy condensed display font for the big "TEE HUB" image-filled text.
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeeHub — Premium Sports Jerseys, Hoodies & Polos",
  description:
    "Shop IPL jerseys, football hoodies, jackets and polo t-shirts at TeeHub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans" suppressHydrationWarning>
        {/* Site chrome rendered once here so every page inherits it. */}
        <div className="w-full min-h-screen overflow-x-hidden">
          <Navbar />
          {children}
          <Footer />
          <BottomBanner />
        </div>
      </body>
    </html>
  );
}
