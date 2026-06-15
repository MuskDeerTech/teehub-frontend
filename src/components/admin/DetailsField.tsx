"use client";

import { FieldLabel, useAllFormFields } from "@payloadcms/ui";
import type { ArrayFieldClientComponent } from "payload";

const DetailsField: ArrayFieldClientComponent = ({ field, path: pathFromProps }) => {
  const path = pathFromProps || field?.name || "details";
  const [fields, dispatch] = useAllFormFields();
  const rowCount = fields?.[path]?.rows?.length ?? 0;

  const setText = (rowIndex: number, value: string) =>
    dispatch({ type: "UPDATE", path: `${path}.${rowIndex}.text`, value });

  const addRow = () =>
    dispatch({
      type: "ADD_ROW",
      path,
      rowIndex: rowCount,
      subFieldState: {
        text: { value: "", initialValue: "", valid: false },
      },
    });

  const removeRow = (rowIndex: number) =>
    dispatch({ type: "REMOVE_ROW", path, rowIndex });

  const inputStyle: React.CSSProperties = {
    padding: "4px 6px",
    background: "var(--theme-input-bg)",
    border: "1px solid var(--theme-elevation-150)",
    borderRadius: 4,
    color: "var(--theme-elevation-800)",
    width: "100%",
  };

  return (
    <div className="field-type">
      <FieldLabel label={field?.label || "Details"} />
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
            gridTemplateColumns: "1fr 28px",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.7 }}>Text</div>
          <div />
          {Array.from({ length: rowCount }).map((_, i) => (
            <Row
              key={String(fields?.[`${path}.${i}.id`]?.value ?? i)}
              text={String(fields?.[`${path}.${i}.text`]?.value ?? "")}
              onText={(value) => setText(i, value)}
              onRemove={() => removeRow(i)}
              inputStyle={inputStyle}
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
          + Add detail
        </button>
      </div>
      {typeof field?.admin?.description === "string" ? (
        <div className="field-description">{field.admin.description}</div>
      ) : null}
    </div>
  );
};

const Row = ({
  text,
  onText,
  onRemove,
  inputStyle,
}: {
  text: string;
  onText: (value: string) => void;
  onRemove: () => void;
  inputStyle: React.CSSProperties;
}) => (
  <>
    <input
      style={inputStyle}
      type="text"
      value={text}
      onChange={(event) => onText(event.target.value)}
    />
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove detail"
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
      x
    </button>
  </>
);

export default DetailsField;
