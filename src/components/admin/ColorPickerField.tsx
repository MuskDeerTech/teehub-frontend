"use client";

import { FieldLabel, useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { useId } from "react";

/**
 * Custom admin field for a hex colour: a native colour swatch sat next to a
 * text box, kept in sync. Pick on the swatch and the hex updates; type a hex and
 * the swatch updates. Stores the same plain `#rrggbb` string the `bg` text field
 * always used, so nothing downstream changes — only the admin UI is richer.
 */
const ColorPickerField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path });
  const id = useId();

  // The native <input type="color"> only accepts a full 6-digit hex; fall back
  // to a neutral grey when the stored value is empty or a shorthand the swatch
  // can't represent, so the picker always has something valid to show.
  const swatchValue = /^#[0-9a-fA-F]{6}$/.test(value ?? "")
    ? (value as string)
    : "#f1f1f1";

  return (
    <div className="field-type text">
      <FieldLabel
        htmlFor={id}
        label={field?.label || "Bg"}
        required={field?.required}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          aria-label="Colour swatch"
          type="color"
          value={swatchValue}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: 40,
            height: 40,
            padding: 0,
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: 4,
            background: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <input
          id={id}
          className="field-type__wrap"
          type="text"
          value={value ?? ""}
          placeholder="#f1f1f1"
          onChange={(e) => setValue(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      {typeof field?.admin?.description === "string" ? (
        <div className="field-description">{field.admin.description}</div>
      ) : null}
    </div>
  );
};

export default ColorPickerField;
