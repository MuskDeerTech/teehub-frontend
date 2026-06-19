"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  IconChevronLeft,
  IconUser,
  IconGift,
  IconCreditCard,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconWallet,
  IconPercentage,
  IconCash,
  IconPlus,
  IconQrcode,
} from "@tabler/icons-react";
import { useCart } from "@/components/cart/CartContext";

const WALLETS = [
  {
    id: "mobikwik",
    label: "Mobikwik Wallet",
    offer:
      "Get upto ₹300 cashback on a transaction with mobikwik wallet on orders above ₹300* T&C",
  },
];

const BANKS = [
  { name: "Razorpay", logo: "/images/bank-logo/rajorpay-logo.png" },
  { name: "HDFC Bank", logo: "/images/bank-logo/hdfc-logo.png" },
  { name: "ICICI Bank", logo: "/images/bank-logo/icici-logo.png" },
  { name: "Axis Bank", logo: "/images/bank-logo/axis-logo.png" },
  {
    name: "STATE Bank of India",
    logo: "/images/bank-logo/statebankofindia-logo.png",
  },
];

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { totalCount, totalMrp, totalPrice, customer, closeCart } = useCart();

  const [selectedCoupon, setSelectedCoupon] = useState<number | null>(1);
  const [selectedPayment, setSelectedPayment] = useState("online");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [makeGift, setMakeGift] = useState<"YES" | "NO" | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onlineTotal = Math.max(0, totalPrice - 30);

  // Back goes to the address page (previous step).
  const handleBack = () => router.push("/checkout/address");

  // Close abandons checkout entirely.
  const handleClose = () => {
    closeCart();
    router.push("/");
  };

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
    setSelectedPayment(id === "online" ? "online" : id);
  };

  const toggleOnline = () => {
    setSelectedPayment((prev) => (prev === "online" ? "" : "online"));
  };

  const toggleCod = () => {
    setSelectedPayment((prev) => (prev === "cod" ? "" : "cod"));
  };

  const toggleWallet = (id: string) => {
    setSelectedWallet((prev) => (prev === id ? null : id));
    setSelectedPayment("wallet");
  };

  const toggleBank = (bank: string) => {
    setSelectedBank((prev) => (prev === bank ? null : bank));
    setSelectedPayment("netbanking");
  };

  const handleContinue = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      // TODO: connect to backend when ready
      // await fetch("/api/payment/initiate", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ paymentMethod: selectedPayment, couponCode, makeGift }),
      // });
      closeCart();
      router.push("/");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl bg-white">
       {/* HEADER */}
      <div className="px-4 pt-5" />
      <div className="flex items-start justify-between px-6">
        <div className="flex flex-1 items-center gap-2">
          <button onClick={handleBack} aria-label="Back to login">
            <IconChevronLeft size={28} />
          </button>

          {/*<Image
            src="/images/teehub-logo.png"
            alt="TeeHub Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />*/}
        </div>

        {/* Price section*/} 
        <div className="ml-auto text-right">
          <p className="text-sm text-gray-500">
            Free gift added • {totalCount} Items
          </p>

          <div className="flex items-center justify-end gap-2">
            <span className="text-l text-gray-400 line-through">
              ₹{totalMrp}
            </span>

            <span className="text-xl font-bold text-[#F26522]">
              ₹{totalPrice}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close and return to store"
          className="flex flex-0 self-right ml-4 text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* BANNER */}
      <div className="mt-5 bg-[#EAEAEA] py-3 text-center text-xl font-semibold">
        9000+ Orders Delivered Last Month
      </div>

      {/* COUPONS */}
      <div className="mt-4 px-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setSelectedCoupon(item)}
              aria-pressed={selectedCoupon === item}
              className={`min-w-[150px] flex-shrink-0 rounded-lg border p-3 text-left transition ${
                selectedCoupon === item
                  ? "border-[#F26522]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-1 flex justify-between">
                <span className="text-xs font-semibold">
                  Coupon Name {item}
                </span>
                <span className="text-[10px] text-gray-500">{item}/6</span>
              </div>
              <div className="text-[11px] text-gray-500 leading-snug">
                Extra discount on selected items
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8 pt-4 flex flex-col gap-4">
        {/* DELIVERY TO */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <IconUser size={18} className="text-gray-600" />
              <span className="font-semibold text-sm">Delivery To</span>
            </div>
            <button
              onClick={handleBack}
              className="text-sm font-semibold text-white bg-[#f36d43] px-4 py-1 rounded-md cursor-pointer"
            >
              Change
            </button>
          </div>
          {customer ? (
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="font-semibold">{customer.fullName}</p>
              <p>{customer.address}</p>
              <p>
                {customer.city}, {customer.state} - {customer.pincode}
              </p>
              <p className="mt-1 text-gray-500">
                {customer.phone} &nbsp; {customer.email}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Add a delivery address to continue.
            </p>
          )}
        </div>

        {/* FREE SHIPPING BANNER */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-green-700">
              FREE Shipping (Delivery 2-5 Days)
            </p>
            <p className="text-xs text-green-600">
              Estimated delivery in 2-5 business days
            </p>
          </div>
          <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded flex-shrink-0">
            Free
          </span>
        </div>

        {/* GIFT CARD */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconGift size={18} className="text-gray-600" />
              <span className="font-semibold text-sm">Have A Gift Card?</span>
            </div>
            <button className="text-sm font-semibold text-[#f36d43] cursor-pointer">
              Redeem
            </button>
          </div>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter gift card / coupon code"
            className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f36d43]"
          />
        </div>

        {/* MAKE THIS A GIFT */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconGift size={18} className="text-gray-600" />
            <span className="font-semibold text-sm">Make This A Gift</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Get Your Items In A Special Gift Bag For Just For Rs. 20.
            </p>
            <div className="flex gap-2 ml-3 flex-shrink-0">
              {(["YES", "NO"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setMakeGift(opt)}
                  className={`text-xs font-semibold px-3 py-1 border rounded transition ${
                    makeGift === opt
                      ? "border-[#f36d43] text-[#f36d43]"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3">
            <IconCreditCard size={18} className="text-gray-600" />
            <span className="font-semibold text-sm">Select Payment Method</span>
          </div>

          {/* ONLINE PAYMENT */}
          <button
            type="button"
            onClick={toggleOnline}
            aria-pressed={selectedPayment === "online"}
            className="flex w-full items-center justify-between border-t border-gray-100 bg-white px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/card-logo/rupay-logo.png"
                alt="RuPay"
                width={32}
                height={22}
                className="object-contain"
              />
              <div>
                <p className="text-sm font-bold">Online Payment</p>
                <p className="text-[11px] text-green-600 font-medium">
                  Save ₹30 and more on online payments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  ₹{onlineTotal}
                </p>
                <p className="text-xs text-gray-400 line-through">
                  ₹{totalPrice}
                </p>
              </div>
              <div
                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center flex-shrink-0 ${
                  selectedPayment === "online"
                    ? "border-[#f36d43] bg-[#f36d43]"
                    : "border-gray-300"
                }`}
              >
                {selectedPayment === "online" && (
                  <IconCheck size={13} color="white" strokeWidth={3} />
                )}
              </div>
            </div>
          </button>

          {/* EXTRA DISCOUNT BANNER */}
          <div className="flex items-center justify-center gap-2 bg-gray-50 border-t border-b border-gray-100 py-2">
            <IconPercentage size={14} className="text-gray-500" />
            <span className="text-xs text-gray-500">
              Extra discount with bank offers
            </span>
          </div>

          {/* UPI  */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("upi")}
              aria-expanded={expandedSection === "upi"}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold">Pay By an UPI App</p>
                <p className="text-[11px] font-medium text-green-600">
                  Offers Available
                </p>
              </div>
              {expandedSection === "upi" ? (
                <IconChevronUp size={18} className="text-gray-400" />
              ) : (
                <IconChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {expandedSection === "upi" && (
              <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                <div className="mt-3 grid grid-cols-2 gap-4">
                  {/* LEFT: Scan & Pay */}
                  <div>
                    <p className="text-base font-bold text-gray-800 mb-1">
                      Scan &amp; Pay
                    </p>
                    <p className="text-xs font-semibold text-[#f36d43] mb-2">
                      + Add UPI ID
                    </p>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f36d43] bg-white"
                    />
                    <button className="mt-2 w-1/2 ml-auto block bg-[#f36d43] hover:opacity-90 text-white text-xs font-semibold py-2 rounded-lg">
                      Submit
                    </button>

                    <div className="flex items-center gap-3 mt-3">
                      {[
                        {
                          name: "PhonePe",
                          logo: "/images/card-logo/phonepay-logo.png",
                        },
                        {
                          name: "RuPay",
                          logo: "/images/card-logo/rupay-logo.png",
                        },
                        {
                          name: "GPay",
                          logo: "/images/card-logo/gpay-logo.png",
                        },
                      ].map((app) => (
                        <div
                          key={app.name}
                          className="flex flex-col items-center gap-1"
                        >
                          <Image
                            src={app.logo}
                            alt={app.name}
                            width={30}
                            height={30}
                            className="object-contain"
                          />
                          <span className="text-[10px] text-gray-500">
                            {app.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: QR code */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full aspect-square max-w-[140px] bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                      <IconQrcode size={64} className="text-gray-700" />
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed text-center mt-2">
                      Click To View And Scan QR Code With Any UPI App
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WALLET */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("wallet")}
              aria-expanded={expandedSection === "wallet"}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold">Wallet</p>
                <p className="text-[11px] font-medium text-green-600">
                  Offers Available
                </p>
              </div>
              {expandedSection === "wallet" ? (
                <IconChevronUp size={18} className="text-gray-400" />
              ) : (
                <IconChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {expandedSection === "wallet" && (
              <div className="bg-gray-50 border-t border-gray-100">
                {WALLETS.map((w) => (
                  <button
                    type="button"
                    key={w.id}
                    onClick={() => toggleWallet(w.id)}
                    aria-pressed={selectedWallet === w.id}
                    className="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0"
                  >
                    <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconWallet size={18} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{w.label}</p>
                      {w.offer && (
                        <p className="text-[11px] text-green-600 mt-0.5 leading-snug">
                          {w.offer}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-6 h-6 border-2 rounded-md flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedWallet === w.id
                          ? "border-[#f36d43] bg-[#f36d43]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedWallet === w.id && (
                        <IconCheck size={13} color="white" strokeWidth={3} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DEBIT / CREDIT CARD */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("card")}
              aria-expanded={expandedSection === "card"}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <p className="text-sm font-semibold">Debit/ Credit Card</p>
              {expandedSection === "card" ? (
                <IconChevronUp size={18} className="text-gray-400" />
              ) : (
                <IconChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {expandedSection === "card" && (
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-4">
                <button className="flex items-center gap-2 text-[#5894C2] text-sm font-semibold">
                  <IconPlus size={16} />
                  Add New Card
                </button>
              </div>
            )}
          </div>

          {/* NET BANKING  */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => toggleSection("netbanking")}
              aria-expanded={expandedSection === "netbanking"}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <p className="text-sm font-semibold">Net Banking</p>
              {expandedSection === "netbanking" ? (
                <IconChevronUp size={18} className="text-gray-400" />
              ) : (
                <IconChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {expandedSection === "netbanking" && (
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-4">
                <div className="flex flex-col gap-2">
                  {BANKS.map((bank) => (
                    <button
                      type="button"
                      key={bank.name}
                      onClick={() => toggleBank(bank.name)}
                      aria-pressed={selectedBank === bank.name}
                      className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2 bg-white text-left transition ${
                        selectedBank === bank.name
                          ? "border-[#f36d43]"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={bank.logo}
                          alt={bank.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />

                        <span className="text-xs font-medium text-gray-700">
                          {bank.name}
                          <p className="text-[11px] font-medium text-green-600">
                            Offers Available
                          </p>
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 border-2 rounded-md flex items-center justify-center flex-shrink-0 ${
                          selectedBank === bank.name
                            ? "border-[#f36d43] bg-[#f36d43]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedBank === bank.name && (
                          <IconCheck size={11} color="white" strokeWidth={3} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CASH ON DELIVERY */}
          <button
            type="button"
            onClick={toggleCod}
            aria-pressed={selectedPayment === "cod"}
            className="flex w-full items-center justify-between border-t border-gray-100 px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <IconCash size={20} className="text-gray-600" />
              <p className="text-sm font-semibold">Cash On Delivery</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">₹{totalPrice}</p>
              <div
                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center flex-shrink-0 ${
                  selectedPayment === "cod"
                    ? "border-[#f36d43] bg-[#f36d43]"
                    : "border-gray-300"
                }`}
              >
                {selectedPayment === "cod" && (
                  <IconCheck size={13} color="white" strokeWidth={3} />
                )}
              </div>
            </div>
          </button>
        </div>

        {submitError && (
          <p className="text-center text-sm text-red-500">{submitError}</p>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-[#f36d43] hover:opacity-90 text-lg font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Continue"}
        </button>

        <p className="text-center text-xs text-gray-400">
          By proceeding, I agree to TeeHub&apos;s
          <span className="underline"> Privacy Policy </span>and
          <span className="underline"> T&amp;C</span>
        </p>

        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <span>It&apos;s a Gift?</span>
          <span className="text-[#f36d43] font-medium cursor-pointer">
            Get it wrapped at just Rs. 30.
          </span>
        </div>
      </div>
    </div>
  );
}