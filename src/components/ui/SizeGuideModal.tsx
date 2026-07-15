"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// Client-only mount flag (true on client, false during SSR) without a
// setState-in-effect — mirrors the pattern used in ProductDetails.
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const ORANGE = "#FA6338";

type Unit = "in" | "cm";

const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

/** Flat-lay garment measurements per size — shared by the product page,
 *  quick-add popup, and the cart panel so the guide reads identically
 *  everywhere. The A/B/C markers match the lines on size-chart.png. */
const MEASUREMENTS: {
  marker: string;
  label: string;
  in: number[];
  cm: number[];
}[] = [
  {
    marker: "A",
    label: "Length",
    in: [25.2, 26.0, 26.6, 27.2, 27.6, 28.0],
    cm: [64, 66, 67.5, 69, 70, 71],
  },
  {
    marker: "B",
    label: "Bust",
    in: [34.6, 36.6, 38.6, 40.6, 42.5, 44.5],
    cm: [88, 93, 98, 103, 108, 113],
  },
  {
    marker: "C",
    label: "Shoulder",
    in: [14.9, 15.4, 15.8, 16.3, 17.2, 17.7],
    cm: [37.8, 39.0, 40.2, 41.4, 42.6, 43.8],
  },
];

const formatValue = (value: number) => value.toFixed(1);

/** Centered size-chart popup. Controlled by the parent (render only when open).
 *  Portaled to <body> so it covers the full viewport even when opened from
 *  inside a transformed ancestor (e.g. the sliding cart drawer). */
export default function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [unit, setUnit] = useState<Unit>("in");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock the page behind the overlay (same pattern as ProductDetails' preview).
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Size chart"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close size chart"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Top: measurement diagram + intro + unit toggle */}
        <div className="grid gap-6 sm:grid-cols-[1.05fr_1fr]">
          <div className="overflow-hidden rounded-lg">
            <Image
              src="/images/size-chart.png"
              alt="T-shirt laid flat with measurement lines: A length, B bust, C shoulder"
              width={640}
              height={427}
              className="h-auto w-full"
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-3xl font-medium text-gray-400 sm:text-4xl">
              Size Chart
            </h2>
            {/* Hard breaks reproduce the design's exact 3-line wrap in the
                two-column layout; on mobile the text wraps naturally. */}
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
              This size chart shows product measurements
              <br className="hidden sm:inline" /> taken when products are laid
              flat. Actual
              <br className="hidden sm:inline" /> product measurements may vary
              by up to 1&quot;.
            </p>

            <div className="mt-6 flex gap-3 sm:mt-auto sm:justify-end">
              {(
                [
                  { value: "in", label: "INCHES" },
                  { value: "cm", label: "CENTIMETER" },
                ] as const
              ).map((option) => {
                const active = unit === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUnit(option.value)}
                    aria-pressed={active}
                    className={`rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-colors ${
                      active
                        ? "text-white"
                        : "border border-gray-300 bg-white text-black hover:border-gray-400"
                    }`}
                    style={active ? { backgroundColor: ORANGE } : undefined}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom: measurement table */}
        <div className="mt-6 overflow-x-auto border-t border-gray-200 pt-5">
          {/* table-fixed + explicit first-column width: column positions are set
              by the grid, not the cell contents, so toggling in/cm never
              reflows the size columns. */}
          <table className="w-full min-w-[520px] table-fixed text-sm sm:text-base">
            <colgroup>
              <col className="w-37.5 sm:w-45" />
              {SIZES.map((size) => (
                <col key={size} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="pb-3 text-left">
                  <span
                    className="inline-block rounded-[4px] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: ORANGE }}
                  >
                    {unit === "in" ? "Inches" : "Centimeter"}
                  </span>
                </th>
                {SIZES.map((size) => (
                  <th
                    key={size}
                    className="pb-3 text-center font-medium"
                    style={{ color: ORANGE }}
                  >
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEASUREMENTS.map((row) => (
                <tr key={row.marker}>
                  <td className="py-3 text-black">
                    <span className="inline-block w-6">{row.marker}</span>
                    {row.label}
                  </td>
                  {row[unit].map((value, i) => (
                    <td key={SIZES[i]} className="py-3 text-center text-gray-900">
                      {formatValue(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  );
}
