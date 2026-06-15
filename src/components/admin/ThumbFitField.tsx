"use client";

import { FieldLabel, useField, useFormFields } from "@payloadcms/ui";
import type { GroupFieldClientComponent } from "payload";
import { useEffect, useRef, useState } from "react";

/**
 *
 * Stores plain numbers — scale (%), x and y offsets (% of the tile) — which
 * MegaMenu replays as a CSS transform, so what you position here is exactly
 * what the navbar dropdown renders.
 */
const TILE = 208; // preview tile size in px — 2× the real 104px menu tile

const ThumbFitField: GroupFieldClientComponent = ({ field, path: pathFromProps }) => {
  const path = pathFromProps || "thumbFit";

  const { value: scale, setValue: setScale } = useField<number | null>({
    path: `${path}.scale`,
  });
  const { value: x, setValue: setX } = useField<number | null>({
    path: `${path}.x`,
  });
  const { value: y, setValue: setY } = useField<number | null>({
    path: `${path}.y`,
  });

  // Live values of the sibling fields, so the preview tracks edits before save.
  const mediaId = useFormFields(([fields]) => fields.thumbnailImage?.value);
  const bg = useFormFields(([fields]) => fields.bg?.value);

  // The form only holds the media doc's id; fetch it to get the file URL.
  // Keyed by id so a stale URL never shows after the upload is swapped/cleared.
  const [loaded, setLoaded] = useState<{
    id: number | string;
    url: string | null;
  } | null>(null);
  const imageUrl = loaded !== null && loaded.id === mediaId ? loaded.url : null;

  useEffect(() => {
    if (typeof mediaId !== "number" && typeof mediaId !== "string") return;
    const controller = new AbortController();
    fetch(`/api/media/${mediaId}`, {
      signal: controller.signal,
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((doc: { url?: string | null }) =>
        setLoaded({ id: mediaId, url: doc.url ?? null }),
      )
      .catch(() => {});
    return () => controller.abort();
  }, [mediaId]);

  const curScale = scale ?? 100;
  const curX = x ?? 0;
  const curY = y ?? 0;

  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageUrl) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, baseX: curX, baseY: curY };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    // px moved → % of the tile, so the same numbers reproduce on the 104px tile.
    const dx = ((e.clientX - drag.current.startX) / TILE) * 100;
    const dy = ((e.clientY - drag.current.startY) / TILE) * 100;
    setX(Math.round((drag.current.baseX + dx) * 10) / 10);
    setY(Math.round((drag.current.baseY + dy) * 10) / 10);
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const reset = () => {
    setScale(100);
    setX(0);
    setY(0);
  };

  return (
    <div className="field-type">
      <FieldLabel label={field?.label || "Thumbnail Fit"} />
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Preview tile — same markup as the MegaMenu tile, at 2× size. */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            width: TILE,
            height: TILE,
            flexShrink: 0,
            borderRadius: 10,
            overflow: "hidden",
            position: "relative",
            backgroundColor: typeof bg === "string" && bg ? bg : "#f1f1f1",
            border: "1px solid var(--theme-elevation-150)",
            cursor: imageUrl ? "grab" : "default",
            touchAction: "none",
            userSelect: "none",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Thumbnail preview"
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `translate(${curX}%, ${curY}%) scale(${curScale / 100})`,
                pointerEvents: "none",
              }}
            />
          ) : (
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
                textAlign: "center",
                fontSize: 12,
                color: "var(--theme-elevation-500)",
              }}
            >
              Upload a Menu Thumbnail above, then position it here.
            </span>
          )}
        </div>

        {/* Controls */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 12, color: "var(--theme-elevation-600)" }}>
            Zoom ({curScale}%)
            <input
              type="range"
              min={20}
              max={300}
              step={1}
              value={curScale}
              disabled={!imageUrl}
              onChange={(e) => setScale(Number(e.target.value))}
              style={{ width: "100%", display: "block", marginTop: 4 }}
            />
          </label>
          <div style={{ fontSize: 12, color: "var(--theme-elevation-600)" }}>
            Offset: {curX}% , {curY}% — drag the image to move it.
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={!imageUrl}
            style={{
              alignSelf: "flex-start",
              padding: "4px 10px",
              background: "var(--theme-elevation-100)",
              border: "1px solid var(--theme-elevation-150)",
              borderRadius: 4,
              color: "var(--theme-elevation-800)",
              cursor: imageUrl ? "pointer" : "default",
              fontSize: 12,
            }}
          >
            Reset
          </button>
        </div>
      </div>
      {typeof field?.admin?.description === "string" ? (
        <div className="field-description">{field.admin.description}</div>
      ) : null}
    </div>
  );
};

export default ThumbFitField;
