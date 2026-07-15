"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconRuler2, IconShoppingBag } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useCart } from "@/components/cart/CartContext";
import {
  CartLineItem,
  PAYMENT_METHODS,
  POLICY_ITEMS,
} from "@/components/cart/CartDetails";
import SizeGuideModal from "@/components/ui/SizeGuideModal";

// Full-page view of the same cart the slide-in drawer shows (CartContext is the
// single source of truth for both). Proceeding leads to the shared checkout
// flow at /checkout/address, exactly like the drawer.

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    cartLoaded,
    totalCount,
    totalMrp,
    totalPrice,
    updateItem,
    removeItem,
    goToStep,
  } = useCart();
  const [showGuide, setShowGuide] = useState(false);

  const discount = totalMrp - totalPrice;

  const handleProceed = () => {
    if (authLoading) return;
    if (user) {
      router.push("/checkout/address");
      return;
    }
    // CartRoot (rendered by the storefront layout) shows the login overlay
    // whenever the cart step is "login" — same flow as the drawer.
    goToStep("login");
  };

  // Until localStorage has been read, render a quiet placeholder instead of
  // flashing "your cart is empty" at shoppers who have items.
  if (!cartLoaded) {
    return <main className="min-h-[60vh] w-full bg-white" />;
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-white px-6 py-16 text-center">
        <IconShoppingBag size={48} stroke={1.3} className="text-gray-300" />
        <h1 className="mt-4 text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a product to begin checkout.
        </p>
        <Link
          href="/all"
          className="mt-6 rounded-xl bg-[#f36d43] px-8 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] w-full bg-white px-[clamp(16px,4vw,80px)] py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Your Cart [{totalCount}]</h1>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-[#f36d43]"
        >
          <IconRuler2 size={15} stroke={1.8} />
          Not sure about your size? View Size Guide
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* Line items */}
        <div className="flex flex-col gap-3 self-start">
          {items.map((item) => (
            <CartLineItem
              key={item.lineId}
              item={item}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Order summary */}
        <aside className="self-start lg:sticky lg:top-24">
          <div className="rounded-lg border border-[#e5e5e5] bg-white p-5">
            <div className="mb-4 rounded-md bg-[#EFEFEF] py-1.5 text-center text-sm">
              Yay!{" "}
              <span className="font-semibold text-green-600">
                Free Delivery
              </span>{" "}
              On This Order!
            </div>

            <h2 className="mb-1.5 text-sm font-semibold">Order Summary</h2>
            {[
              {
                label: "Total MRP (Incl. Of Taxes)",
                value: `₹${totalMrp.toLocaleString("en-IN")}`,
                color: "",
              },
              {
                label: "Discount On MRP",
                value: `-₹${discount.toLocaleString("en-IN")}`,
                color: "text-green-600",
              },
              {
                label: "Coupon Discount",
                value: "₹0",
                color: "text-green-600",
              },
              {
                label: "Delivery Fee",
                value: "FREE",
                color: "text-green-600",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">{label}</span>
                <span className={color}>{value}</span>
              </div>
            ))}
            <div className="mt-1 flex justify-between border-y border-gray-200 py-1.5 text-sm font-bold">
              <span>Total Payable</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              className="mt-4 w-full rounded-xl bg-[#f36d43] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Proceed To Buy
            </button>
            <p className="mt-1.5 text-center text-xs text-gray-400">
              Safe and secure checkout
            </p>

            <div className="mt-5 grid grid-cols-5 gap-1 text-center">
              {POLICY_ITEMS.map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                    <Icon size={20} stroke={1.5} className="text-gray-600" />
                  </div>
                  <span className="whitespace-pre-line text-[9px] leading-tight text-gray-500">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-2.5">
              {PAYMENT_METHODS.map(({ name, src, scale }) => (
                <div
                  key={name}
                  className="flex h-10 w-13 shrink-0 items-center justify-center"
                >
                  <Image
                    src={src}
                    alt={name}
                    width={52}
                    height={32}
                    className="h-8 w-13 object-contain"
                    style={{ transform: `scale(${scale})` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {showGuide && <SizeGuideModal onClose={() => setShowGuide(false)} />}
    </main>
  );
}
