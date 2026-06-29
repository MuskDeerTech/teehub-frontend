"use client";

import { FieldLabel, useField } from "@payloadcms/ui";
import type { JSONFieldClientComponent } from "payload";

type SavedCartItem = {
  name?: unknown;
  quantity?: unknown;
  size?: unknown;
  price?: unknown;
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const SavedCartField: JSONFieldClientComponent = ({ field, path }) => {
  const { value } = useField<unknown>({ path });
  const items = Array.isArray(value) ? (value as SavedCartItem[]) : [];

  return (
    <div className="field-type">
      <FieldLabel label={field?.label || "Saved cart"} />
      <div
        style={{
          border: "1px solid var(--theme-elevation-150)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              padding: "12px 14px",
              color: "var(--theme-elevation-500)",
              fontSize: 13,
            }}
          >
            No saved cart items.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${String(item.name ?? "item")}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 12,
                padding: "12px 14px",
                borderTop:
                  index === 0
                    ? "none"
                    : "1px solid var(--theme-elevation-100)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: "var(--theme-elevation-900)",
                    fontSize: 14,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {String(item.name ?? "Unnamed product")}
                </div>
                <div
                  style={{
                    color: "var(--theme-elevation-500)",
                    fontSize: 12,
                    marginTop: 3,
                  }}
                >
                  Qty: {String(item.quantity ?? 1)}
                  {item.size ? ` · Size: ${String(item.size)}` : ""}
                </div>
              </div>
              <div
                style={{
                  color: "var(--theme-elevation-700)",
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {formatPrice(item.price)}
              </div>
            </div>
          ))
        )}
      </div>
      {typeof field?.admin?.description === "string" ? (
        <div className="field-description">{field.admin.description}</div>
      ) : null}
    </div>
  );
};

function formatPrice(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? inr.format(amount) : "";
}

export default SavedCartField;
