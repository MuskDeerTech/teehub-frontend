"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconChevronLeft,
  IconMapPin,
  IconUser,
  IconFileCheck,
} from "@tabler/icons-react";

interface CartRegisterProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSuccess?: () => void;
}

const INPUT =
  "w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f36d43] rounded-sm";

export default function CartRegister({ open, onClose, onBack, onSuccess }: CartRegisterProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<number | null>(1);
  const [saveAs, setSaveAs] = useState<"Home" | "Work">("Home");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    pincode: "",
    city: "",
    state: "",
    flatHouse: "",
    apartment: "",
    fullName: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  if (!open) return null;

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: "" }));
    };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.pincode || form.pincode.length !== 6) e.pincode = "Enter valid 6-digit pincode";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!form.flatHouse.trim()) e.flatHouse = "Required";
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter valid email";
    return e;
  };

  const handleContinue = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setSubmitError("");

    try {
       /*TODO: replace with real API call when backend is ready
       await fetch("/api/register", {
       method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ ...form, saveAs }),
     });*/

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch{
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* SHEET */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-[#F5F5F5] shadow-2xl">

        {/* HEADER */}
        <div className="px-6 pt-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <button onClick={onBack ?? onClose}>
                <IconChevronLeft size={28} />
              </button>
              <Image
                src="/images/teehub-logo.png"
                alt="TeeHub Logo"
                width={120}
                height={40}
                className="h-14 w-auto"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Free gift added • 6 Items</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-xl text-gray-400 line-through">₹2500</span>
                <span className="text-4xl font-bold text-[#F26522]">₹1200</span>
              </div>
            </div>
          </div>
        </div>

        {/* BANNER */}
        <div className="mt-5 bg-[#EAEAEA] py-3 text-center text-xl font-semibold">
          9000+ Orders Delivered Last Month
        </div>

        {/* COUPONS */}
        <div className="mt-4 px-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                onClick={() => setSelectedCoupon(item)}
                className={`min-w-[150px] flex-shrink-0 cursor-pointer rounded-lg border p-3 transition ${
                  selectedCoupon === item ? "border-[#F26522]" : "border-gray-200 bg-white"
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

        {/* SUCCESS BANNER */}
        {showSuccess && (
          <div className="mx-6 mt-4 flex items-center justify-center gap-2 rounded-md bg-green-100 py-2 text-sm font-semibold text-green-700">
            <IconFileCheck size={18} />
            Registered Successfully
          </div>
        )}

        <div className="px-6 pb-8 pt-4">

          {/* DELIVERY ADDRESS */}
          <div className="mb-4 flex items-center gap-2">
            <IconMapPin size={20} />
            <span className="font-semibold text-base">Add Delivery Address</span>
          </div>

          {/* Pincode / City / State */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Pincode</label>
              <input
                className={INPUT}
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setForm((f) => ({ ...f, pincode: v }));
                  setErrors((er) => ({ ...er, pincode: "" }));
                }}
              />
              {errors.pincode && <p className="text-[10px] text-red-500 mt-0.5">{errors.pincode}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">City</label>
              <input className={INPUT} value={form.city} onChange={set("city")} />
              {errors.city && <p className="text-[10px] text-red-500 mt-0.5">{errors.city}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">State</label>
              <input className={INPUT} value={form.state} onChange={set("state")} />
              {errors.state && <p className="text-[10px] text-red-500 mt-0.5">{errors.state}</p>}
            </div>
          </div>

          {/* Flat / House */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Flat House Number</label>
            <input className={INPUT} value={form.flatHouse} onChange={set("flatHouse")} />
            {errors.flatHouse && <p className="text-[10px] text-red-500 mt-0.5">{errors.flatHouse}</p>}
          </div>

          {/* Apartment */}
          <div className="mb-6">
            <label className="text-xs text-gray-500 mb-1 block">Apartment, Area, Sector, Village</label>
            <input className={INPUT} value={form.apartment} onChange={set("apartment")} />
          </div>

          {/* CUSTOMER INFO */}
          <div className="mb-4 flex items-center gap-2">
            <IconUser size={20} />
            <span className="font-semibold text-base">Customer Information</span>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Full Name*</label>
            <input className={INPUT} value={form.fullName} onChange={set("fullName")} />
            {errors.fullName && <p className="text-[10px] text-red-500 mt-0.5">{errors.fullName}</p>}
          </div>

          <div className="mb-6">
            <label className="text-xs text-gray-500 mb-1 block">Email Address*</label>
            <input className={INPUT} type="email" value={form.email} onChange={set("email")} />
            {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
          </div>

          {/* SAVE ADDRESS AS */}
          <div className="mb-6">
            <div className="flex items-center gap-1 mb-3">
              <div className="flex h-8 w-8 items-center justify-center cursor-pointer">
                <IconFileCheck size={20} color="black" />
              </div>
              <span className="text-sm font-medium">Save Address As</span>
            </div>
            <div className="flex gap-3">
              {(["Home", "Work"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSaveAs(type)}
                  className={`px-6 py-1.5 rounded-full border text-sm font-medium transition ${
                    saveAs === type
                      ? "border-[#f36d43] text-[#f36d43]"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* CONTINUE */}
          {submitError && (
            <p className="mb-3 text-center text-sm text-red-500">{submitError}</p>
          )}
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full h-14 rounded-xl bg-[#f36d43] hover:opacity-90 text-lg font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Continue"}
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            By proceeding, I agree to TeeHub&apos;s
            <span className="underline"> Privacy Policy </span>and
            <span className="underline"> T&amp;C</span>
          </p>

          {/* GIFT FOOTER */}
          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-500">
            <span>It&apos;s a Gift?</span>
            <span className="text-[#f36d43] font-medium cursor-pointer">Get it wrapped at just Rs. 30.</span>
          </div>
        </div>
      </div>
    </>
  );
}