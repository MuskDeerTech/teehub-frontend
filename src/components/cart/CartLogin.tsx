"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconChevronLeft,
  IconUserCircle,
  IconCheck,
} from "@tabler/icons-react";

interface CartLoginProps {
  open: boolean;
  onClose: () => void;
}

export default function CartLogin({ open, onClose }: CartLoginProps) {
  const [mobile, setMobile] = useState("");
  const [updates, setUpdates] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<number | null>(1);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Popup Dimensions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-[#F5F5F5] shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <button onClick={onClose}>
                <IconChevronLeft size={28} />
              </button>

              <div>
  <Image
    src="/images/teehub-logo.png"
    alt="TeeHub Logo"
    width={120}
    height={40}
    className="h-14 w-auto"
  />
</div>
            </div>  

            <div className="text-right">
              <p className="text-sm text-gray-500">Free gift added • 6 Items</p>

              <div className="flex items-center justify-end gap-2">
                <span className="text-xl text-gray-400 line-through">
                  ₹2500
                </span>
                <span className="text-4xl font-bold text-[#F26522]">₹1200</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-[#EAEAEA] py-3 text-center text-xl font-semibold">
          2 Lakhs Happy Customers
        </div>

        {/* COUPONS  */}
        <div className="mt-4 px-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                onClick={() => setSelectedCoupon(item)}
                className={`min-w-[150px] flex-shrink-0 cursor-pointer rounded-lg border p-3 transition ${
                  selectedCoupon === item
                    ? "border-[#F26522] "
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="mb-1 flex justify-between">
                  <span className="text-xs font-semibold">Coupon Name {item}</span>

                  <span className="text-[10px] text-gray-500">{item}/6</span>
                </div>

                <div className="text-[11px] text-gray-500 leading-snug">
                  Extra discount on selected items
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem Button */}
        <div className="px-4">
          <button className="mt-5 w-full bg-[#C7C7C7] py-3 font-medium text-white">
            Login To Redeem Gift Card
          </button>
        </div>

        {/* Login */}
        <div className="px-6 py-6">
          <div className="mb-5 flex items-center gap-2">
            <IconUserCircle size={24} />
            <span className="text-lg font-medium">Login To Continue</span>
          </div>

          {/* Mobile */}
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-semibold">
              +91
            </span>

            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter Mobile Number"
              className="h-16 w-full rounded-full border border-gray-400 bg-transparent pl-20 pr-4 outline-none"
            />
          </div>

          {/* Checkbox*/}
          <label
            className="mt-8 flex cursor-pointer items-center gap-3"
            onClick={() => setUpdates(!updates)}
          >
            <div className="flex h-6 w-6 items-center justify-center border border-gray-500">
              {updates && <IconCheck size={16} />}
            </div>

            <span className="text-sm text-gray-500">
              Send me order updates & offer - (no spam)
            </span>
          </label>

          {/* Continue */}
          <button className="mt-8 h-14 w-full rounded-xl bg-[#FF6633E5] text-lg font-semibold text-white">
            Continue
          </button>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-gray-400">
            By proceeding, I agree to TeeHub&apos;s
            <span className="underline"> Privacy Policy </span>
             and
            <span className="underline"> T&amp;C</span>
          </p>
        </div>
      </div>
    </>
  );
}
