import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/Footer";

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
      <body >
        <CartProvider>
          <Header />
          {children}

          {/* ✅ Toastify Container (Global) */}
          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover={false}
            theme="colored"
          />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
