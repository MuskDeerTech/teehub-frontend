"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconMail,
  IconPackage,
  IconPhone,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconTruckDelivery,
} from "@tabler/icons-react";

type LookupMode = "awb" | "order";

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

export default function TrackOrderForm() {
  const [mode, setMode] = useState<LookupMode>("awb");
  const [value, setValue] = useState("");
  const [submittedValue, setSubmittedValue] = useState("");

  const activeCopy = modeCopy[mode];

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
            setSubmittedValue(value.trim());
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
                      setSubmittedValue("");
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
                    setSubmittedValue("");
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

          {submittedValue && (
            <div className="mt-5 rounded-xl border border-[#F26522]/20 bg-[#fff7f2] p-4 text-sm text-gray-700">
              <span className="font-semibold text-[#F26522]">
                {activeCopy.inputLabel}:
              </span>{" "}
              {submittedValue}
              <p className="mt-1 text-gray-500">
                Live shipment lookup can be connected here when the courier
                tracking API is ready.
              </p>
            </div>
          )}
        </form>

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
