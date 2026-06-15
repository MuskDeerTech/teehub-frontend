"use client";

import { useState, useEffect, useRef } from "react";
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
  const [mobileError, setMobileError] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");

  // OTP STATE
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer
  useEffect(() => {
    if (!timerActive || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); setTimerActive(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec} min`;
  };

  if (!open) return null;

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(val);
    if (mobileError) setMobileError("");
  };

  const handleContinue = () => {
    if (mobile.length !== 10) {
      setMobileError("Please Enter Your Correct Phone Number.");
      return;
    }
    setMobileError("");
    setStep("otp");
    setOtp(["", "", "", "", ""]);
    setOtpError("");
    setSecondsLeft(120);
    setTimerActive(true);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (otpError) setOtpError("");
    if (digit && index < 4) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpContinue = () => {
    const filled = otp.join("");
    if (filled.length !== 5) {
      setOtpError("Please enter the 5-digit OTP.");
      return;
    }
    setOtpError("");
  };

  const handleResend = () => {
    setSecondsLeft(120);
    setTimerActive(true);
    setOtp(["", "", "", "", ""]);
    setOtpError("");
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* SHEET */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-[#F5F5F5] shadow-2xl">

        {/* HEADER */}
        <div className="px-6 pt-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <button onClick={step === "otp" ? () => setStep("mobile") : onClose}>
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
                <span className="text-xl text-gray-400 line-through">₹2500</span>
                <span className="text-4xl font-bold text-[#F26522]">₹1200</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 bg-[#EAEAEA] py-3 text-center text-xl font-semibold">
          2 Lakhs Happy Customers
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

        {/* Redeem Button */}
        <div className="px-4">
          <button className="mt-5 w-full bg-[#C7C7C7] py-3 font-medium text-white">
            Login To Redeem Gift Card
          </button>
        </div>

        {/* MOBILE */}
        {step === "mobile" && (
          <div className="px-6 py-6">
            <div className="mb-5 flex items-center gap-2">
              <IconUserCircle size={24} />
              <span className="text-lg font-medium">Login To Continue</span>
            </div>

            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-semibold">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="Enter Mobile Number"
                className={`h-16 w-full rounded-full border bg-transparent pl-20 pr-4 outline-none transition-colors ${
                  mobileError ? "border-red-500" : "border-gray-400"
                }`}
              />
            </div>
            {mobileError && (
              <p className="mt-2 pl-6 text-xs text-red-500">{mobileError}</p>
            )}

            <label className="mt-8 flex cursor-pointer items-center gap-3" onClick={() => setUpdates(!updates)}>
              <div className="flex h-6 w-6 items-center justify-center border border-gray-500">
                {updates && <IconCheck size={16} />}
              </div>
              <span className="text-sm text-gray-500">
                Send me order updates &amp; offer - (no spam)
              </span>
            </label>

            <button
              onClick={handleContinue}
              className="mt-8 h-14 w-full rounded-[12px] bg-[#f36d43] hover:opacity-90 text-lg font-semibold text-white"
            >
              Continue
            </button>

            <p className="mt-5 text-center text-xs text-gray-400">
              By proceeding, I agree to TeeHub&apos;s
              <span className="underline"> Privacy Policy </span>and
              <span className="underline"> T&amp;C</span>
            </p>
          </div>
        )}

        {/* STEP: OTP */}
        {step === "otp" && (
          <div className="px-6 py-6">
            <div className="mb-6 flex items-center gap-2">
              <IconUserCircle size={24} />
              <span className="text-lg font-medium">Enter OTP</span>
            </div>

            {/* OTP BOX */}
            <div className="flex justify-center gap-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`h-10 w-10 appearance-none rounded-10px border-0 border-b bg-transparent text-center text-xl font-bold outline-none transition-colors ${
                    otpError ? "border-red-400" : "border-black"
                  }`}
                  style={{ borderRadius: 0, boxShadow: "none" }}
                />
              ))}
            </div>

            {otpError && (
              <p className="mt-3 text-center text-xs text-red-500">{otpError}</p>
            )}

            {/* INFO TEXT */}
            <p className="mt-6 text-center text-sm text-gray-500">
              You Must Have Received a{" "}
              <span className="font-semibold text-[#f36d43]">5 digit OTP</span> On Your Registered Number
            </p>

            {/* RESEND / TIMER */}
            <p className="mt-3 text-center text-sm text-gray-500">
              {secondsLeft > 0 ? (
                <>Resend In <span className="font-semibold text-[#f36d43]">{formatTime(secondsLeft)}</span></>
              ) : (
                <button onClick={handleResend} className="font-semibold text-[#f36d43] underline">
                  Resend OTP
                </button>
              )}
            </p>

            <button
              onClick={handleOtpContinue}
              className="mt-8 h-14 w-full rounded-[12px] bg-[#f36d43] hover:opacity-90 text-lg font-semibold text-white"
            >
              Continue
            </button>

            <p className="mt-5 text-center text-xs text-gray-400">
              By proceeding, I agree to TeeHub&apos;s
              <span className="underline"> Privacy Policy </span>and
              <span className="underline"> T&amp;C</span>
            </p>
          </div>
        )}

      </div>
    </>
  );
}