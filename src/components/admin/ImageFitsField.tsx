"use client";

import { FieldLabel, useField, useFormFields } from "@payloadcms/ui";
import type { JSONFieldClientComponent } from "payload";
import { useEffect, useRef, useState } from "react";

/**
 * Instagram-style fit editor for the product gallery. One compact block no
 * matter how many images the product has: a strip of small thumbnails on top
 * (click to pick), and a single preview card below (the product's `bg` colour
 * with the selected image on it) where you drag to position and zoom with a
 * slider.
 *
 * Stored as `{ [mediaId]: { scale, x, y } }` — keyed by the upload's id, not
 * its position, so reordering the Images array never shuffles the fits.
 * Entries for removed images are simply ignored by the storefront.
 */
type Fit = { scale?: number; x?: number; y?: number };

// Preview card matches the 3:4 gallery card on the product page.
const TILE_W = 240;
const TILE_H = 320;

const ImageFitsField: JSONFieldClientComponent = ({ field, path: pathFromProps }) => {
  const path = pathFromProps || "imageFits";
  const { value, setValue } = useField<Record<string, Fit> | null>({ path });

  // Live values of the sibling fields, so the editor tracks edits before save.
  const imagesValue = useFormFields(([fields]) => fields.images?.value);
  const bg = useFormFields(([fields]) => fields.bg?.value);

  // The form holds the gallery as media ids (or objects wrapping an id).
  const imageIds: string[] = Array.isArray(imagesValue)
    ? imagesValue
        .map((item) => {
          if (typeof item === "number" || typeof item === "string") return String(item);
          if (typeof item === "object" && item !== null) {
            const o = item as { id?: number | string; value?: number | string };
            const id = o.id ?? o.value;
            return id != null ? String(id) : null;
          }
          return null;
        })
        .filter((id): id is string => id !== null)
    : [];
  const idsKey = imageIds.join(",");

  // id → file URL/alt, fetched in one query whenever the gallery changes.
  const [mediaMap, setMediaMap] = useState<
    Record<string, { url: string | null; alt?: string }>
  >({});

  useEffect(() => {
    if (!idsKey) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      "where[id][in]": idsKey,
      limit: "100",
      depth: "0",
    });
    fetch(`/api/media?${params.toString()}`, {
      signal: controller.signal,
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then(
        (data: {
          docs?: { id: number | string; url?: string | null; alt?: string }[];
        }) => {
          setMediaMap((prev) => {
            const next = { ...prev };
            for (const doc of data.docs ?? []) {
              next[String(doc.id)] = { url: doc.url ?? null, alt: doc.alt };
            }
            return next;
          });
        },
      )
      .catch(() => {});
    return () => controller.abort();
  }, [idsKey]);

  // Selected thumbnail; falls back to the first image if the pick disappears.
  const [selected, setSelected] = useState<string | null>(null);
  const activeId =
    selected && imageIds.includes(selected) ? selected : (imageIds[0] ?? null);
  const activeUrl = activeId ? (mediaMap[activeId]?.url ?? null) : null;

  const fits: Record<string, Fit> =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const cur: Fit = (activeId ? fits[activeId] : undefined) ?? {};
  const curScale = cur.scale ?? 100;
  const curX = cur.x ?? 0;
  const curY = cur.y ?? 0;

  const patch = (p: Partial<Fit>) => {
    if (!activeId) return;
    setValue({
      ...fits,
      [activeId]: { scale: curScale, x: curX, y: curY, ...p },
    });
  };

  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeUrl) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, baseX: curX, baseY: curY };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    // px moved → % of the card, so the same numbers reproduce at any card size.
    const dx = ((e.clientX - drag.current.startX) / TILE_W) * 100;
    const dy = ((e.clientY - drag.current.startY) / TILE_H) * 100;
    patch({
      x: Math.round((drag.current.baseX + dx) * 10) / 10,
      y: Math.round((drag.current.baseY + dy) * 10) / 10,
    });
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const bgColor = typeof bg === "string" && bg ? bg : "#f1f1f1";

  return (
    <div className="field-type">
      <FieldLabel label={field?.label || "Image Fit"} />

      {imageIds.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--theme-elevation-500)" }}>
          Upload images above first, then position them here.
        </div>
      ) : (
        <>
          {/* Thumbnail strip — click to choose which image you're adjusting. */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {imageIds.map((id, i) => {
              const isActive = id === activeId;
              const url = mediaMap[id]?.url;
              return (
                <button
                  key={`${id}-${i}`}
                  type="button"
                  onClick={() => setSelected(id)}
                  aria-label={`Edit image ${i + 1}`}
                  style={{
                    width: 44,
                    height: 58,
                    padding: 0,
                    borderRadius: 6,
                    overflow: "hidden",
                    cursor: "pointer",
                    backgroundColor: bgColor,
                    border: isActive
                      ? "2px solid var(--theme-elevation-800)"
                      : "1px solid var(--theme-elevation-150)",
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={mediaMap[id]?.alt || `Image ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        pointerEvents: "none",
                      }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {/* Preview card — same 3:4 shape as the product-page gallery card. */}
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                width: TILE_W,
                height: TILE_H,
                flexShrink: 0,
                borderRadius: 8,
                overflow: "hidden",
                position: "relative",
                backgroundColor: bgColor,
                border: "1px solid var(--theme-elevation-150)",
                cursor: activeUrl ? "grab" : "default",
                touchAction: "none",
                userSelect: "none",
              }}
            >
              {activeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeUrl}
                  alt="Fit preview"
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
              ) : null}
            </div>

            {/* Controls for the selected image. */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, color: "var(--theme-elevation-600)" }}>
                Zoom ({curScale}%)
                <input
                  type="range"
                  min={20}
                  max={300}
                  step={1}
                  value={curScale}
                  disabled={!activeUrl}
                  onChange={(e) => patch({ scale: Number(e.target.value) })}
                  style={{ width: "100%", display: "block", marginTop: 4 }}
                />
              </label>
              <div style={{ fontSize: 12, color: "var(--theme-elevation-600)" }}>
                Offset: {curX}% , {curY}% — drag the image to move it.
              </div>
              <button
                type="button"
                onClick={() => patch({ scale: 100, x: 0, y: 0 })}
                disabled={!activeUrl}
                style={{
                  alignSelf: "flex-start",
                  padding: "4px 10px",
                  background: "var(--theme-elevation-100)",
                  border: "1px solid var(--theme-elevation-150)",
                  borderRadius: 4,
                  color: "var(--theme-elevation-800)",
                  cursor: activeUrl ? "pointer" : "default",
                  fontSize: 12,
                }}
              >
                Reset this image
              </button>
            </div>
          </div>
        </>
      )}

      {typeof field?.admin?.description === "string" ? (
        <div className="field-description">{field.admin.description}</div>
      ) : null}
    </div>
  );
};

export default ImageFitsField;
