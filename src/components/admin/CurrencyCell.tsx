"use client";

import type { DefaultCellComponentProps } from "payload";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export default function CurrencyCell({
  cellData,
}: DefaultCellComponentProps) {
  const amount = Number(cellData ?? 0);
  return <span>{inr.format(Number.isFinite(amount) ? amount : 0)}</span>;
}
