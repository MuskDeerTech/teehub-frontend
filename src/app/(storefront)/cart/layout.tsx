import type { Metadata } from "next";

// The cart is a real page with its own URL, but like checkout it's personal,
// session-specific content — search engines are told to keep it out of results.
export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
