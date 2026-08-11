"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { EXCHANGE_REASONS, type ExchangeReason } from "@/lib/orders/exchange";

// Client-only mount flag (true on client, false during SSR) without a
// setState-in-effect — same pattern as SizeGuideModal.
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Reason picker for the "Exchange" button on an order line. The parent owns the
 * request itself, so this only collects a reason and reports submit state —
 * which keeps the order list the single place that knows how to talk to the
 * exchange endpoint.
 */
export default function RequestExchangeModal({
  itemName,
  submitting,
  error,
  onSubmit,
  onClose,
}: {
  itemName: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (reason: ExchangeReason) => void;
  onClose: () => void;
}) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [reason, setReason] = useState<ExchangeReason | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

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
      aria-labelledby="request-exchange-title"
      onClick={() => !submitting && onClose()}
    >
      <form
        className="w-full max-w-[440px] rounded-xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (reason) onSubmit(reason);
        }}
      >
        <h2
          id="request-exchange-title"
          className="text-lg font-bold text-[#111]"
        >
          Request an exchange
        </h2>
        <p className="mt-1 text-[13px] text-[#7a7a7a]">{itemName}</p>

        <fieldset className="mt-5">
          <legend className="text-[13px] font-semibold text-[#333]">
            Why are you exchanging this?
          </legend>

          <div className="mt-2.5 flex flex-col gap-2">
            {EXCHANGE_REASONS.map((option) => {
              const isSelected = reason === option;
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[14px] transition-colors ${
                    isSelected
                      ? "border-[#F26522] bg-[#FFF4EF] text-[#111]"
                      : "border-[#E4E4E4] text-[#333] hover:border-[#B4B4B4]"
                  }`}
                >
                  <input
                    type="radio"
                    name="exchange-reason"
                    value={option}
                    checked={isSelected}
                    onChange={() => setReason(option)}
                    className="h-4 w-4 shrink-0 accent-[#F26522]"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* `role="alert"` so a failed submit is announced — the button that
            triggered it keeps focus, so nothing else would read this out. */}
        {error && (
          <p role="alert" className="mt-3 text-[13px] text-[#C0392B]">
            {error}
          </p>
        )}

        <p className="mt-4 text-[12px] leading-relaxed text-[#8a8a8a]">
          We&apos;ll review your request and get back to you. You can track it on
          this order.
        </p>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 cursor-pointer rounded-md border border-[#D9D9D9] px-4 text-[14px] font-semibold text-[#333] transition-colors hover:border-[#B4B4B4] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!reason || submitting}
            className="h-10 cursor-pointer rounded-md bg-[#F26522] px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Submit request"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
