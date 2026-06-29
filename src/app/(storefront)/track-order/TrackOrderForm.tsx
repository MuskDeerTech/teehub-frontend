"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClock,
  IconMail,
  IconPackage,
  IconPhone,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconTruckDelivery,
} from "@tabler/icons-react";

type LookupMode = "awb" | "order";
type SubmittedLookup = {
  mode: LookupMode;
  value: string;
};

type OrderLookup = {
  type: "order";
  orderId: string;
  placedOn: string;
  status: string;
  total: string;
  awb?: string;
  items: Array<{
    name: string;
    meta: string;
  }>;
};

type TrackingLookup = {
  type: "tracking";
  orderId: string;
  placedOn: string;
  deliveryDate: string;
  status: string;
  courier: string;
  awb: string;
  updates: Array<{
    date: string;
    time: string;
    label: string;
  }>;
};

type LookupResult = OrderLookup | TrackingLookup;

const modeCopy: Record<
  LookupMode,
  { label: string; inputLabel: string; placeholder: string }
> = {
  awb: {
    label: "Tracking ID / AWB",
    inputLabel: "Tracking ID / AWB",
    placeholder: "Enter AWB number",
  },
  order: {
    label: "Order ID",
    inputLabel: "Order ID",
    placeholder: "Enter order ID",
  },
};

function normaliseOrderId(value: string) {
  return value.trim().replace(/^#/, "").toUpperCase();
}

function buildLookupResult({ mode, value }: SubmittedLookup): LookupResult {
  const cleanValue = value.trim();

  if (mode === "awb" || normaliseOrderId(cleanValue) === "TH79289") {
    return {
      type: "tracking",
      orderId: mode === "order" ? normaliseOrderId(cleanValue) : "TH79289",
      placedOn: "24 Jun 2026",
      deliveryDate: "29 Jun 2026",
      status: "Delivered",
      courier: "Velocity Shipping",
      awb: mode === "awb" ? cleanValue : "370381653837",
      updates: [
        {
          date: "29 Jun 2026",
          time: "1:36 pm",
          label: "Shipment was delivered with onetime passcode.",
        },
        { date: "29 Jun 2026", time: "11:33 am", label: "Out for delivery" },
        {
          date: "29 Jun 2026",
          time: "2:00 am",
          label: "Arrived at carrier facility",
        },
        { date: "26 Jun 2026", time: "1:38 pm", label: "Pickup done" },
        { date: "25 Jun 2026", time: "2:17 pm", label: "Ready for pickup" },
      ],
    };
  }

  return {
    type: "order",
    orderId: normaliseOrderId(cleanValue) || "TH79555",
    placedOn: "24 Jun 2026",
    status: "Processing",
    total: "Rs. 999",
    items: [
      {
        name: "Team India New Travel Jacket Blue And White",
        meta: "Qty: 1    Size: XL",
      },
    ],
  };
}

export default function TrackOrderForm() {
  const [mode, setMode] = useState<LookupMode>("awb");
  const [value, setValue] = useState("");
  const [submittedLookup, setSubmittedLookup] = useState<SubmittedLookup | null>(
    null,
  );

  const activeCopy = modeCopy[mode];
  const result = submittedLookup ? buildLookupResult(submittedLookup) : null;

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e8] text-[#F26522]">
            <IconPackage size={26} stroke={1.7} />
          </div>
          <div>
            <h1 className="text-[clamp(24px,3vw,36px)] font-extrabold tracking-tight text-[#111]">
              Track your order
            </h1>
            <p className="mt-2 max-w-[760px] text-sm leading-6 text-gray-500">
              Search using your TeeHub order ID or your tracking ID/AWB from the
              shipping notification.
            </p>
          </div>
        </div>

        <form
          className="mt-8"
          onSubmit={(event) => {
            event.preventDefault();
            const nextValue = value.trim();
            if (!nextValue) return;
            setSubmittedLookup({ mode, value: nextValue });
          }}
        >
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">Select by</p>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              {(Object.keys(modeCopy) as LookupMode[]).map((option) => {
                const selected = mode === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setMode(option);
                      setSubmittedLookup(null);
                    }}
                    className={`flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition ${
                      selected
                        ? "border-[#F26522] bg-[#fff0e8] text-[#F26522]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        selected ? "bg-[#F26522]" : "bg-gray-300"
                      }`}
                    />
                    {modeCopy[option].label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-7 block">
            <span className="text-sm font-semibold text-gray-700">
              {activeCopy.inputLabel}
            </span>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <IconSearch
                  size={20}
                  stroke={1.7}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setSubmittedLookup(null);
                  }}
                  placeholder={activeCopy.placeholder}
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#F26522] focus:ring-4 focus:ring-[#F26522]/10"
                />
              </div>
              <button
                type="submit"
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F26522] px-7 text-sm font-bold text-white transition hover:bg-[#e95719]"
              >
                Track
                <IconArrowRight size={18} stroke={2} />
              </button>
            </div>
          </label>
        </form>

        {result && <LookupResultPanel result={result} />}

        <div className="mt-8 grid gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
          {[
            { icon: IconTruckDelivery, label: "Packed and shipped updates" },
            { icon: IconShieldCheck, label: "Secure order verification" },
            { icon: IconRefresh, label: "Damaged shipment support" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
            >
              <Icon size={20} stroke={1.7} className="text-[#F26522]" />
              {label}
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-2xl bg-[#252525] p-6 text-white shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[1px] text-white/50">
              Need help?
            </p>
            <h2 className="mt-1 text-xl font-bold">Seller&apos;s Support Details</h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#F26522]">
            <IconTruckDelivery size={25} stroke={1.8} />
          </div>
        </div>

        <div className="space-y-4">
          <SupportRow
            icon={<IconPhone size={19} stroke={1.8} />}
            label="Phone no."
            value="8220907987"
            href="tel:8220907987"
          />
          <SupportRow
            icon={<IconMail size={19} stroke={1.8} />}
            label="Email Id"
            value="teehubshop@gmail.com"
            href="mailto:teehubshop@gmail.com"
          />
          <div className="rounded-xl bg-white/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[1px] text-white/45">
              Return & Exchange Policy
            </p>
            <Link
              href="/policies/return-exchange-policy"
              className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:text-[#ff8a55]"
            >
              View policy
              <IconArrowRight size={16} stroke={2} />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function LookupResultPanel({ result }: { result: LookupResult }) {
  if (result.type === "tracking") {
    return <TrackingResult result={result} />;
  }

  return <OrderPendingResult result={result} />;
}

function TrackingResult({ result }: { result: TrackingLookup }) {
  return (
    <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-sm font-semibold text-gray-500">Delivery Date</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-extrabold text-blue-700">
              {result.deliveryDate}
            </p>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase text-green-700">
              {result.status}
            </span>
          </div>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:min-w-[300px]">
          <InfoBlock label="Order ID" value={result.orderId} />
          <InfoBlock label="Order placed on" value={result.placedOn} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-400">
            {result.courier}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            Tracking ID:{" "}
            <span className="text-blue-700 underline underline-offset-2">
              {result.awb}
            </span>
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-green-700 ring-1 ring-green-100">
          <IconCheck size={15} />
          AWB tracking active
        </span>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <h2 className="text-lg font-bold text-gray-950">Tracking Updates</h2>
        <div className="mt-4 space-y-5">
          {result.updates.map((update, index) => (
            <div key={`${update.date}-${update.time}-${index}`} className="grid grid-cols-[96px_24px_1fr] gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900">{update.date}</p>
                <p className="mt-1 text-xs text-gray-400">{update.time}</p>
              </div>
              <div className="relative flex justify-center">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-700" />
                {index < result.updates.length - 1 && (
                  <span className="absolute top-4 h-[calc(100%+16px)] border-l border-dashed border-gray-300" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {update.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderPendingResult({ result }: { result: OrderLookup }) {
  return (
    <div className="mt-8 rounded-2xl border border-[#F26522]/15 bg-[#fffaf7] p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#F26522]">Order Found</p>
          <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
            {result.orderId}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your order is being prepared. Tracking will appear here once the
            parcel is shipped.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-bold uppercase text-[#F26522] ring-1 ring-orange-100">
          <IconClock size={15} />
          AWB not assigned yet
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <InfoBlock label="Order status" value={result.status} />
        <InfoBlock label="Order placed on" value={result.placedOn} />
        <InfoBlock label="Total" value={result.total} />
      </div>

      <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-orange-100">
        <p className="text-sm font-bold text-gray-950">Items ordered</p>
        <div className="mt-3 space-y-3">
          {result.items.map((item) => (
            <div key={item.name} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff0e8] text-[#F26522]">
                <IconPackage size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {["Order confirmed", "Preparing order", "AWB pending", "Shipped"].map(
          (step, index) => (
            <div
              key={step}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                index < 2
                  ? "border-green-100 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-400"
              }`}
            >
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-white">
                {index < 2 ? <IconCheck size={15} /> : <IconCalendar size={15} />}
              </div>
              {step}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-950">{value}</p>
    </div>
  );
}

function SupportRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 rounded-xl bg-white/8 p-4 transition hover:bg-white/12"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#ff8a55]">
        {icon}
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[1px] text-white/45">
          {label}
        </span>
        <span className="mt-1 block text-sm font-semibold text-white">
          {value}
        </span>
      </span>
    </a>
  );
}
