"use client";

import { useConfig } from "@payloadcms/ui";
import type { DefaultCellComponentProps } from "payload";
import { formatAdminURL } from "payload/shared";

export default function OrderNumberCell({
  cellData,
  collectionSlug,
  link,
  linkURL,
  rowData,
}: DefaultCellComponentProps) {
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();
  const rawOrderNumber =
    typeof cellData === "string" ? cellData : String(cellData ?? "");
  const orderNumber = rawOrderNumber.replace(/^WC-/, "");
  const customerName =
    typeof rowData.fullName === "string" ? rowData.fullName.trim() : "";
  const label = [`#${orderNumber}`, customerName].filter(Boolean).join(" ");
  // Payload only passes `linkURL` when the collection defines `formatDocURL`;
  // otherwise a custom cell is told to `link` and must build the URL itself,
  // the same way Payload's DefaultCell does.
  const href =
    linkURL ||
    (link && rowData.id != null
      ? formatAdminURL({
          adminRoute,
          path: `/collections/${collectionSlug}/${encodeURIComponent(String(rowData.id))}`,
        })
      : undefined);

  return href ? (
    <a href={href} className="order-list__number">
      {label}
    </a>
  ) : (
    <span className="order-list__number">{label}</span>
  );
}
