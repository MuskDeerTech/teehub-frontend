"use client";

import { useEffect, type ReactNode } from "react";

type CheckoutOverlayProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: "drawer" | "sheet";
  ariaLabel: string;
};

export default function CheckoutOverlay({
  open,
  onClose,
  children,
  variant = "sheet",
  ariaLabel,
}: CheckoutOverlayProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const panelClass =
    variant === "drawer"
      ? `scrollbar-hide absolute right-0 top-0 h-full w-full max-w-[420px] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`
      : `scrollbar-hide absolute bottom-0 left-1/2 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 overflow-y-auto rounded-t-[28px] bg-[#F5F5F5] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close checkout"
        onClick={onClose}
        className={`absolute inset-0 h-full w-full bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={panelClass}
      >
        {children}
      </section>
    </div>
  );
}
