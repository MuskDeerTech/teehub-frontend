"use client";

import Image from "next/image";
import { useState } from "react";
import {
  IconTruckReturn,
  IconCash,
  IconTruck,
  IconShieldCheck,
  IconBolt,
} from "@tabler/icons-react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const POLICY_ITEMS = [
  { Icon: IconTruckReturn, label: "Return &\nExchange" },
  { Icon: IconCash, label: "Cash On\nDelivery" },
  { Icon: IconTruck, label: "Delivery\nCharges" },
  { Icon: IconShieldCheck, label: "Secure\nPayments" },
  { Icon: IconBolt, label: "Fast\nDelivery" },
];

const PAYMENT_METHODS = [
  { name: "Visa", src: "/images/card-logo/visa-logo.png" },
  { name: "RuPay", src: "/images/card-logo/rupay-logo.png" },
  { name: "Mastercard", src: "/images/card-logo/mastercard-logo.webp" },
  { name: "GPay", src: "/images/card-logo/gpay-logo.png" },
  { name: "Paytm", src: "/images/card-logo/paytm-logo.jpg" },
  { name: "PhonePe", src: "/images/card-logo/phonepay-logo.png" },
];

interface CartItem {
  id: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
  mrp: number;
  customName?: string;
}

interface CartDetailsProps {
  item: CartItem;
  onClose: () => void;
  onProceed: () => void;
}

export default function CartDetails({ item, onClose, onProceed }: CartDetailsProps) {
  const [quantity, setQuantity] = useState<number>(item.quantity ?? 1);
  const [sizeIndex, setSizeIndex] = useState<number>(
    SIZES.indexOf(item.size) !== -1 ? SIZES.indexOf(item.size) : 2,
  );

  const selectedSize = SIZES[sizeIndex];
  const totalMrp = item.mrp * quantity;
  const totalPrice = item.price * quantity;
  const discount = totalMrp - totalPrice;
  const discountPct = Math.round(((item.mrp - item.price) / item.mrp) * 100);

  const btnBase =
    "w-4 h-4 flex items-center justify-center text-white text-xl leading-none font-bold flex-shrink-0";
  const minusBtn = `${btnBase} rounded-full`;
  const plusBtn = `${btnBase} rounded-md`;
  const btnColor = "#564E4E";

  return (
    <div className="fixed inset-0 z-[99] flex items-start justify-center pt-20 px-4">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-[560px] max-h-[calc(100vh-6rem)] bg-white flex flex-col shadow-2xl rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Your Cart [{item ? 1 : 0}]</h2>
          <button onClick={onClose} className="text-xl leading-none">
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {/* PRODUCT CARD */}
          <div className="flex gap-3 mx-4 mt-4 border border-gray-200 rounded-xl p-3">
            <Image
              src={item.image}
              alt={item.name}
              width={110}
              height={110}
              className="rounded-lg object-cover flex-shrink-0 self-start"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-black text-base">₹{item.price}</span>
                <span className="line-through text-gray-400 text-sm">₹{item.mrp}</span>
                <span className="text-green-600 text-xs font-medium">({discountPct}% Off)</span>
              </div>

              <h3 className="font-semibold mt-1 text-sm leading-snug">{item.name}</h3>

              {item.customName ? (
                <p className="text-xs text-gray-500 mt-1">
                  Custom Details :{" "}
                  <span className="font-medium text-gray-700">{item.customName}</span>
                </p>
              ) : null}

              {/* QUANTITY + SIZE */}
              <div className="flex items-start gap-4 mt-3">
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                    Quantity
                  </p>
                  <div className="inline-flex items-center gap-4 rounded-lg border border-gray-200 px-3 py-1">
                    <button
                      className={minusBtn}
                      style={{ backgroundColor: btnColor }}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      className={plusBtn}
                      style={{ backgroundColor: btnColor }}
                      onClick={() => setQuantity((q) => q + 1)}
                    >+</button>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-gray-500 font-medium mb-1.5 uppercase tracking-wide">
                    Size
                  </p>
                  <div className="inline-flex items-center gap-4 rounded-lg border border-gray-200 px-3 py-1">
                    <button
                      className={minusBtn}
                      style={{ backgroundColor: btnColor }}
                      onClick={() => setSizeIndex((i) => Math.max(0, i - 1))}
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold">{selectedSize}</span>
                    <button
                      className={plusBtn}
                      style={{ backgroundColor: btnColor }}
                      onClick={() => setSizeIndex((i) => Math.min(SIZES.length - 1, i + 1))}
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YAY FREE DELIVERY */}
          <div className="mt-4 py-2 text-center text-sm" style={{ backgroundColor: "#EFEFEF" }}>
            Yay!{" "}
            <span className="font-semibold text-green-600">Free Delivery</span>{" "}
            On This Order!
          </div>

          {/* ORDER SUMMARY */}
          <div className="px-4 mt-5">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-600">Total MRP (Incl. Of Taxes)</span>
              <span>₹{totalMrp}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-600">Discount On MRP</span>
              <span className="text-green-600">-₹{discount}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-600">Coupon Discount</span>
              <span className="text-green-600">₹0</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-base py-2 border-t border-b border-gray-200">
              <span>Total Payable</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>

          {/* POLICY ICONS */}
          <div className="px-6 mt-5 grid grid-cols-5 gap-2 text-center">
            {POLICY_ITEMS.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="w-13 h-13 rounded-full bg-gray-200 flex items-center justify-center">
                  <Icon size={30} stroke={1.5} className="text-gray-600" />
                </div>
                <span className="text-[12px] text-gray-500 leading-tight whitespace-pre-line">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* PAYMENT METHOD LOGOS */}
          <div className="px-6 mt-5 flex flex-wrap items-center gap-9">
            {PAYMENT_METHODS.map(({ name, src }) => (
              <div key={name} className="h-19 flex items-center justify-center">
                <Image
                  src={src}
                  alt={name}
                  width={52}
                  height={28}
                  className="object-contain"
                />
              </div>
            ))}
          </div>

          {/* SHIPPING + ESTIMATED TOTAL */}
          <div className="px-4 mt-5 pb-4 flex flex-col gap-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span className="text-gray-700 font-medium">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span>Estimated Total</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 pt-3 pb-4 border-t border-gray-200 bg-white">
          <button
            onClick={onProceed}
            className="w-full bg-[#f36d43] hover:opacity-90 text-white py-3 rounded-xl font-semibold text-base"
          >
            Proceed To Buy
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            🔒 Safe and Secure Check out
          </p>
        </div>
      </div>
    </div>
  );
}