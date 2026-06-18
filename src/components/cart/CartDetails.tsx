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

  const btnColor = "#564E4E";

  const StepBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="w-5 h-5 flex items-center justify-center text-white text-sm font-bold rounded-md flex-shrink-0"
      style={{ backgroundColor: btnColor }}
    >
      {children}
    </button>
  );

  return (
    // Single scroll container — no nested overflow
    <div className="fixed inset-0 z-[99] overflow-hidden">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* DRAWER */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-white flex flex-col shadow-2xl overflow-y-auto">

        {/* HEADER  */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-5 border-b border-gray-200">
          <h2 className="font-semibold text-base">Your Cart [{item ? 1 : 0}]</h2>
          <button onClick={onClose} className="text-xl leading-none">✕</button>
        </div>

        {/* PRODUCT CARD */}
        <div className="flex gap-3 mx-4 mt-3 border border-gray-200 rounded-xl p-3">
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="rounded-lg object-cover flex-shrink-0 self-start"
          />

          {/* right side  */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-black text-sm">₹{item.price}</span>
              <span className="line-through text-gray-400 text-xs">₹{item.mrp}</span>
              <span className="text-green-600 text-[11px] font-medium">({discountPct}% Off)</span>
            </div>

            <h3 className="font-semibold mt-1 text-sm leading-snug truncate">{item.name}</h3>

            {item.customName && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                Custom: <span className="font-medium text-gray-700">{item.customName}</span>
              </p>
            )}

            {/* QUANTITY + SIZE  */}
            <div className="flex items-start gap-2 mt-2">
              {/* Quantity */}
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">QUANTITY</p>
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-1.5 py-1">
                  <StepBtn onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</StepBtn>
                  <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                  <StepBtn onClick={() => setQuantity((q) => q + 1)}>+</StepBtn>
                </div>
              </div>

              {/* Size */}
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">Size</p>
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-1.5 py-1">
                  <StepBtn onClick={() => setSizeIndex((i) => Math.max(0, i - 1))}>−</StepBtn>
                  <span className="w-12 text-center text-sm font-semibold">{selectedSize}</span>
                  <StepBtn onClick={() => setSizeIndex((i) => Math.min(SIZES.length - 1, i + 1))}>+</StepBtn>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* YAY FREE DELIVERY */}
        <div className="mt-3 py-1.5 text-center text-sm" style={{ backgroundColor: "#EFEFEF" }}>
          Yay! <span className="font-semibold text-green-600">Free Delivery</span> On This Order!
        </div>

        {/* ORDER SUMMARY */}
        <div className="px-4 mt-3">
          <h3 className="font-semibold mb-1.5 text-sm">Order Summary</h3>
          {[
            { label: "Total MRP (Incl. Of Taxes)", value: `₹${totalMrp}`, color: "" },
            { label: "Discount On MRP", value: `-₹${discount}`, color: "text-green-600" },
            { label: "Coupon Discount", value: "₹0", color: "text-green-600" },
            { label: "Delivery Fee", value: "FREE", color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between text-sm py-1">
              <span className="text-gray-600">{label}</span>
              <span className={color}>{value}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-sm py-1.5 border-t border-b border-gray-200 mt-1">
            <span>Total Payable</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>

        {/* POLICY ICONS */}
        <div className="px-4 mt-3 grid grid-cols-5 gap-1 text-center">
          {POLICY_ITEMS.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <Icon size={20} stroke={1.5} className="text-gray-600" />
              </div>
              <span className="text-[9px] text-gray-500 leading-tight whitespace-pre-line">{label}</span>
            </div>
          ))}
        </div>

        {/* PAYMENT LOGOS */}
        <div className="px-4 mt-7 flex flex-wrap items-center gap-3">
          {PAYMENT_METHODS.map(({ name, src }) => (
            <div key={name} className="h-4 flex items-center">
              <Image src={src} alt={name} width={54} height={10} className="object-contain" />
            </div>
          ))}
        </div>

        {/* SHIPPING + ESTIMATED TOTAL */}
        <div className="px-4 mt-7 flex flex-col gap-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Shipping</span>
            <span className="text-gray-700 font-medium">FREE</span>
          </div>
          <div className="flex justify-between font-bold text-sm">
            <span>Estimated Total</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 pt-3 pb-4 mt-3 border-t border-gray-200 bg-white">
          <button
            onClick={onProceed}
            className="w-full bg-[#f36d43] hover:opacity-90 text-white py-2.5 rounded-xl font-semibold text-sm"
          >
            Proceed To Buy
          </button>
          <p className="text-center text-xs text-gray-400 mt-1.5">🔒 Safe and Secure Check out</p>
        </div>
      </div>
    </div>
  );
}