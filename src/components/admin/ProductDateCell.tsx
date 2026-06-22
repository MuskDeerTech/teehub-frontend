"use client";

import type { DefaultCellComponentProps } from "payload";

const exactDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const WOOCOMMERCE_STORE_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export default function ProductDateCell({
  cellData,
  rowData,
}: DefaultCellComponentProps) {
  const storedDate = new Date(String(cellData ?? ""));
  if (Number.isNaN(storedDate.getTime())) return <span>—</span>;

  const isWooCommerceProduct =
    rowData.woocommerceId !== undefined && rowData.woocommerceId !== null;
  const date = isWooCommerceProduct
    ? new Date(storedDate.getTime() - WOOCOMMERCE_STORE_OFFSET_MS)
    : storedDate;

  return (
    <span title={String(cellData ?? "")}>{exactDate.format(date)}</span>
  );
}
