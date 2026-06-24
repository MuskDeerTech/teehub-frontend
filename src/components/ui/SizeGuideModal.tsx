"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

// Client-only mount flag (true on client, false during SSR) without a
// setState-in-effect — mirrors the pattern used in ProductDetails.
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** Chest measurement per size — shared by the product page, quick-add popup,
 *  and the cart panel so the guide reads identically everywhere. */
const SIZE_CHART = [
  { size: "XS", chest: "34–36 in" },
  { size: "S", chest: "36–38 in" },
  { size: "M", chest: "38–40 in" },
  { size: "L", chest: "40–42 in" },
  { size: "XL", chest: "42–44 in" },
  { size: "XXL", chest: "44–46 in" },
];

/** Centered size-chart popup. Controlled by the parent (render only when open).
 *  Portaled to <body> so it covers the full viewport even when opened from
 *  inside a transformed ancestor (e.g. the sliding cart drawer). */
export default function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-black">Size Guide</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-gray-500 transition-colors hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">Chest</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map(({ size, chest }) => (
                <tr key={size} className="border-t border-gray-100">
                  <td className="py-2 font-semibold text-black">{size}</td>
                  <td className="py-2 text-gray-600">{chest}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-400">
            Highly stretchable fabric — order by your waist size for the best fit.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
