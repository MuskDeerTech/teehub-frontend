"use client";

import type { DefaultCellComponentProps } from "payload";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
const exactDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

// Legacy WooCommerce dates were saved as store-local wall-clock values.
const WOOCOMMERCE_STORE_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function formatDate(value: unknown, shiftWooCommerceDate: boolean) {
  const storedDate = new Date(String(value ?? ""));
  if (Number.isNaN(storedDate.getTime())) return "—";
  if (storedDate.getUTCFullYear() <= 1900) return "—";

  const date = shiftWooCommerceDate
    ? new Date(storedDate.getTime() - WOOCOMMERCE_STORE_OFFSET_MS)
    : storedDate;
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
  collectionSlug,
  rowData,
}: DefaultCellComponentProps) {
  const shiftWooCommerceDate =
    collectionSlug === "orders"
      ? rowData.woocommerceId !== undefined && rowData.woocommerceId !== null
      : collectionSlug === "customers"
        ? rowData.lastActiveSource === "woocommerce" ||
          (!rowData.lastActiveSource &&
            rowData.woocommerceId !== undefined &&
            rowData.woocommerceId !== null)
        : false;

  return (
    <span title={String(cellData ?? "")}>
      {formatDate(cellData, shiftWooCommerceDate)}
    </span>
  );
}
