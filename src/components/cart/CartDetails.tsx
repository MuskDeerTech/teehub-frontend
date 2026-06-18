"use client";

import Image from "next/image";
import {
  IconBolt,
  IconCash,
  IconShieldCheck,
  IconShoppingBag,
  IconTruck,
  IconTruckReturn,
} from "@tabler/icons-react";
import type { CartItem } from "./CartContext";
import CheckoutOverlay from "./CheckoutOverlay";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const POLICY_ITEMS = [
  { Icon: IconTruckReturn, label: "Return &\nExchange" },
  { Icon: IconCash, label: "Cash On\nDelivery" },
  { Icon: IconTruck, label: "Delivery\nCharges" },
  { Icon: IconShieldCheck, label: "Secure\nPayments" },
  { Icon: IconBolt, label: "Fast\nDelivery" },
];

const PAYMENT_METHODS = [
  { name: "Visa", src: "/images/card-logo/visa-logo.png", scale: 0.95 },
  { name: "RuPay", src: "/images/card-logo/rupay-logo.png", scale: 1 },
  {
    name: "Mastercard",
    src: "/images/card-logo/mastercard-logo.webp",
    scale: 0.95,
  },
  { name: "GPay", src: "/images/card-logo/gpay-logo.png", scale: 1.12 },
  { name: "Paytm", src: "/images/card-logo/paytm-logo.jpg", scale: 1.12 },
  {
    name: "PhonePe",
    src: "/images/card-logo/phonepay-logo.png",
    scale: 0.9,
  },
];

type CartDetailsProps = {
  open: boolean;
  item: CartItem | null;
  totalCount: number;
  totalMrp: number;
  totalPrice: number;
  onUpdate: (lineId: string, changes: Partial<CartItem>) => void;
  onClose: () => void;
  onProceed: () => void;
};

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#564E4E] text-sm font-bold text-white"
    >
      {children}
    </button>
  );
}

export default function CartDetails({
  open,
  item,
  totalCount,
  totalMrp,
  totalPrice,
  onUpdate,
  onClose,
  onProceed,
}: CartDetailsProps) {
  const discount = totalMrp - totalPrice;
  const discountPercent =
    item && item.mrp > 0
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
      : 0;
  const sizeIndex = item ? Math.max(0, SIZES.indexOf(item.size)) : 0;

  return (
    <CheckoutOverlay
      open={open}
      onClose={onClose}
      variant="drawer"
      ariaLabel="Shopping cart"
    >
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-5">
          <h2 className="text-base font-semibold">Your Cart [{totalCount}]</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {!item ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <IconShoppingBag size={42} stroke={1.3} className="text-gray-300" />
            <h3 className="mt-4 text-base font-semibold">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a product to begin checkout.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-4 mt-3 flex gap-3 rounded-xl border border-gray-200 p-3">
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="shrink-0 self-start rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-black">
                    ₹{item.price}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{item.mrp}
                  </span>
                  <span className="text-[11px] font-medium text-green-600">
                    ({discountPercent}% Off)
                  </span>
                </div>

                <h3 className="mt-1 truncate text-sm font-semibold leading-snug">
                  {item.name}
                </h3>

                <div className="mt-2 flex items-start gap-2">
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                      Quantity
                    </p>
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-1.5 py-1">
                      <StepButton
                        label="Decrease quantity"
                        onClick={() =>
                          onUpdate(item.lineId, {
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        }
                      >
                        −
                      </StepButton>
                      <span className="w-12 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <StepButton
                        label="Increase quantity"
                        onClick={() =>
                          onUpdate(item.lineId, {
                            quantity: item.quantity + 1,
                          })
                        }
                      >
                        +
                      </StepButton>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                      Size
                    </p>
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-1.5 py-1">
                      <StepButton
                        label="Previous size"
                        onClick={() =>
                          onUpdate(item.lineId, {
                            size: SIZES[Math.max(0, sizeIndex - 1)],
                          })
                        }
                      >
                        −
                      </StepButton>
                      <span className="w-12 text-center text-sm font-semibold">
                        {item.size}
                      </span>
                      <StepButton
                        label="Next size"
                        onClick={() =>
                          onUpdate(item.lineId, {
                            size: SIZES[
                              Math.min(SIZES.length - 1, sizeIndex + 1)
                            ],
                          })
                        }
                      >
                        +
                      </StepButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 bg-[#EFEFEF] py-1.5 text-center text-sm">
              Yay!{" "}
              <span className="font-semibold text-green-600">Free Delivery</span>{" "}
              On This Order!
            </div>

            <div className="mt-3 px-4">
              <h3 className="mb-1.5 text-sm font-semibold">Order Summary</h3>
              {[
                {
                  label: "Total MRP (Incl. Of Taxes)",
                  value: `₹${totalMrp}`,
                  color: "",
                },
                {
                  label: "Discount On MRP",
                  value: `-₹${discount}`,
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
                <div
                  key={label}
                  className="flex justify-between py-1 text-sm"
                >
                  <span className="text-gray-600">{label}</span>
                  <span className={color}>{value}</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-y border-gray-200 py-1.5 text-sm font-bold">
                <span>Total Payable</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1 px-4 text-center">
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

            <div className="mt-7 flex items-center justify-between gap-2.5 px-4">
              {PAYMENT_METHODS.map(({ name, src, scale }) => (
                <div
                  key={name}
                  className="flex h-10 w-[52px] shrink-0 items-center justify-center"
                >
                  <Image
                    src={src}
                    alt={name}
                    width={52}
                    height={32}
                    className="h-8 w-[52px] object-contain"
                    style={{ transform: `scale(${scale})` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-1 px-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="font-medium text-gray-700">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>Estimated Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <div className="mt-3 border-t border-gray-200 bg-white px-4 pb-4 pt-3">
              <button
                type="button"
                onClick={onProceed}
                className="w-full rounded-xl bg-[#f36d43] py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Proceed To Buy
              </button>
              <p className="mt-1.5 text-center text-xs text-gray-400">
                Safe and secure checkout
              </p>
            </div>
          </>
        )}
      </div>
    </CheckoutOverlay>
  );
}
