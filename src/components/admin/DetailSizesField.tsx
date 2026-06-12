"use client";

import { FieldLabel, useAllFormFields } from "@payloadcms/ui";
import type { ArrayFieldClientComponent } from "payload";

/**
 * Compact replacement for the default `detailSizes` array UI. Instead of a tall,
 * separately-bordered collapsible box per size, every size is one short row
 * (Label + Stock) inside a single small container. Reads/writes the same array
 * row state Payload tracks, so the stored `{ label, stock }[]` shape is unchanged.
 */
const DetailSizesField: ArrayFieldClientComponent = ({ field, path: pathFromProps }) => {
  const path = pathFromProps || field?.name || "detailSizes";
  const [fields, dispatch] = useAllFormFields();

  // Row count comes from the array field's own tracked `rows`.
  const rowCount = fields?.[path]?.rows?.length ?? 0;

  const setValue = (rowIndex: number, sub: "label" | "stock", value: string | number) =>
    dispatch({ type: "UPDATE", path: `${path}.${rowIndex}.${sub}`, value });

  const addRow = () =>
    dispatch({
      type: "ADD_ROW",
      path,
      rowIndex: rowCount,
      subFieldState: {
        label: { value: "", initialValue: "", valid: false },
        stock: { value: 0, initialValue: 0, valid: true },
      },
    });

  const removeRow = (rowIndex: number) =>
    dispatch({ type: "REMOVE_ROW", path, rowIndex });

  const cell: React.CSSProperties = {
    padding: "4px 6px",
    background: "var(--theme-input-bg)",
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: 4,
    color: "var(--theme-elevation-800)",
    width: "100%",
  };

  return (
    <div className="field-type">
      <FieldLabel label={field?.label || "Detail Sizes"} />
      <div
        style={{
          border: "1px solid var(--theme-elevation-150)",
          borderRadius: 4,
          padding: 8,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 28px",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.7 }}>Label</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Stock</div>
          <div />
          {Array.from({ length: rowCount }).map((_, i) => (
            <Row
              key={String(fields?.[`${path}.${i}.id`]?.value ?? i)}
              label={String(fields?.[`${path}.${i}.label`]?.value ?? "")}
              stock={Number(fields?.[`${path}.${i}.stock`]?.value ?? 0)}
              onLabel={(v) => setValue(i, "label", v)}
              onStock={(v) => setValue(i, "stock", v)}
              onRemove={() => removeRow(i)}
              cell={cell}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          style={{
            marginTop: 8,
            padding: "4px 10px",
            background: "var(--theme-elevation-100)",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: 4,
            color: "var(--theme-elevation-800)",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          + Add size
        </button>
      </div>
      {typeof field?.admin?.description === "string" ? (
        <div className="field-description">{field.admin.description}</div>
      ) : null}
    </div>
  );
};

const Row = ({
  label,
  stock,
  onLabel,
  onStock,
  onRemove,
  cell,
}: {
  label: string;
  stock: number;
  onLabel: (v: string) => void;
  onStock: (v: number) => void;
  onRemove: () => void;
  cell: React.CSSProperties;
}) => (
  <>
    <input style={cell} type="text" value={label} onChange={(e) => onLabel(e.target.value)} />
    <input
      style={cell}
      type="number"
      min={0}
      value={stock}
      onChange={(e) => onStock(e.target.value === "" ? 0 : Number(e.target.value))}
    />
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove size"
      style={{
        height: 28,
        width: 28,
        background: "none",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 4,
        color: "var(--theme-elevation-600)",
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      ×
    </button>
  </>
);

export default DetailSizesField;
