"use client";

import type { DefaultCellComponentProps } from "payload";

export default function OrderNumberCell({
  cellData,
  linkURL,
  rowData,
}: DefaultCellComponentProps) {
  const rawOrderNumber =
    typeof cellData === "string" ? cellData : String(cellData ?? "");
  const orderNumber = rawOrderNumber.replace(/^WC-/, "");
  const customerName =
    typeof rowData.fullName === "string" ? rowData.fullName.trim() : "";
  const label = [`#${orderNumber}`, customerName].filter(Boolean).join(" ");

  return linkURL ? (
    <a href={linkURL} className="order-list__number">
      {label}
    </a>
  ) : (
    <span className="order-list__number">{label}</span>
  );
}
