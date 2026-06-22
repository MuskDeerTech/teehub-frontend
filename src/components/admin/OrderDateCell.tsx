"use client";

import type { DefaultCellComponentProps } from "payload";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
const exactDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

// WooCommerce's `date_created` is store-local time without an offset. During
// the legacy import it was persisted as though that wall-clock value were UTC.
// Shift it back to the store's UTC+05:30 timezone before calculating "ago".
const WOOCOMMERCE_STORE_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function formatOrderDate(value: unknown) {
  const storedDate = new Date(String(value ?? ""));
  if (!Number.isNaN(storedDate.getTime()) && storedDate.getUTCFullYear() <= 1900) {
    return "\u2014";
  }
  if (Number.isNaN(storedDate.getTime())) return "—";
  const date = new Date(
    storedDate.getTime() - WOOCOMMERCE_STORE_OFFSET_MS,
  );

  const elapsedMs = Date.now() - date.getTime();
  if (elapsedMs < 0) return exactDate.format(date);

  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return rtf.format(-minutes, "minute");

  const hours = Math.floor(elapsedMs / 3_600_000);
  if (hours < 24) return rtf.format(-hours, "hour");

  return exactDate.format(date);
}

export default function OrderDateCell({
  cellData,
}: DefaultCellComponentProps) {
  return <span title={String(cellData ?? "")}>{formatOrderDate(cellData)}</span>;
}
