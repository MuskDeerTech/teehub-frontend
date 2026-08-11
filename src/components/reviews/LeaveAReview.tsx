"use client";

import { useId, useRef, useState } from "react";
import {
  IconCloudUpload,
  IconLock,
  IconStar,
  IconStarFilled,
  IconX,
} from "@tabler/icons-react";
import { REVIEWS_GUTTER } from "@/components/reviews/gutter";

const ORANGE = "#f26522";

const TEXT_40 = "text-[clamp(22px,2.78vw,40px)]"; // section heading (SF Pro)
const TEXT_16 = "text-[clamp(11px,1.11vw,16px)]"; // upload headline
const TEXT_14 = "text-[clamp(10px,0.97vw,14px)]"; // labels, fields, footer note
const TEXT_13 = "text-[clamp(9.5px,0.9vw,13px)]"; // upload hints

/** Border, radius and focus treatment shared by both text fields and the
 *  textarea, so the three can't drift apart. */
const FIELD =
  "w-full rounded-[clamp(4px,0.42vw,6px)] border border-[#e0e0e0] bg-white px-[clamp(8px,0.9vw,13px)] text-[#111] outline-none transition placeholder:text-[#a5a5a5] focus:border-[#f26522] focus:ring-4 focus:ring-[#f26522]/10";

const MAX_IMAGES = 5;

/** Either up to five images or a single video — never a mix, which is what the
 *  hint under the dropzone promises. A dropped video wins, since choosing it is
 *  the more deliberate act. */
function pickFiles(incoming: File[]): File[] {
  const video = incoming.find((file) => file.type.startsWith("video/"));
  if (video) return [video];
  return incoming
    .filter((file) => file.type.startsWith("image/"))
    .slice(0, MAX_IMAGES);
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block font-sans ${TEXT_14} font-semibold text-[#111]`}
    >
      {children}
    </label>
  );
}

/** The five-star input. Hovering previews the score the click would set, which
 *  is the only way a star row reads as interactive before it's been used. */
function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div
      className="flex items-center gap-[clamp(6px,0.76vw,11px)]"
      onMouseLeave={() => setHovered(0)}
      role="radiogroup"
      aria-label="Overall rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isOn = star <= shown;
        const Icon = isOn ? IconStarFilled : IconStar;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="cursor-pointer leading-none transition-transform hover:scale-105"
            // `1em` against an explicit font size, not a clamp on `size` — that
            // lands in the SVG width attribute, which takes no CSS functions.
            style={{
              color: isOn ? ORANGE : "#111",
              fontSize: "clamp(20px,2.2vw,32px)",
            }}
          >
            <Icon size="1em" stroke={1.5} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

/**
 * "Leave a Review" — the submission form closing the page.
 *
 * The rating, the fields and the uploads are all live client state, and the
 * form validates on submit. It does not post anywhere yet: `reviews` has
 * `create: isAdmin`, so the public REST route can't accept one, and the
 * collection requires a `product` this form doesn't ask for — it collects an
 * order number instead, which something server-side has to resolve. Wiring it
 * means a custom route beside the `api/auth/*` ones.
 */
export default function LeaveAReview() {
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    setFiles(pickFiles([...incoming]));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const found: string[] = [];
    if (rating === 0) found.push("Pick an overall rating.");
    if (!title.trim()) found.push("Add a review title.");
    if (!body.trim()) found.push("Write your review.");
    setErrors(found);

    // TODO: POST to a custom submit route once one exists — see the note above.
  };

  return (
    <section className={`pb-[clamp(32px,5.4vw,78px)] ${REVIEWS_GUTTER}`}>
      <h2
        className={`font-sfpro ${TEXT_40} font-bold uppercase tracking-[0.2px] text-[#111]`}
      >
        Leave a Review
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-[clamp(20px,3.4vw,49px)] grid grid-cols-1 gap-[clamp(16px,2.3vw,33px)] lg:grid-cols-[minmax(0,408fr)_minmax(0,831fr)]"
      >
        {/* Left: rating + uploads. A flex column so the dropzone can stretch to
            the bottom of the taller right-hand column, as the design has it. */}
        <div className="flex flex-col">
          <p className={`font-sans ${TEXT_14} font-semibold text-[#111]`}>
            Overall Rating
          </p>

          <div className="mt-[clamp(10px,1.6vw,23px)]">
            <RatingPicker value={rating} onChange={setRating} />
          </div>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={`mt-[clamp(11px,1.1vw,16px)] flex flex-1 cursor-pointer flex-col items-center justify-center rounded-[clamp(5px,0.55vw,8px)] border px-[clamp(12px,1.4vw,20px)] py-[clamp(18px,2.4vw,34px)] text-center transition-colors ${
              isDragging
                ? "border-[#f26522] bg-[#fff6f2]"
                : "border-[#e0e0e0] bg-white hover:border-[#c4c4c4]"
            }`}
            style={{ minHeight: "clamp(110px,11.1vw,160px)" }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="sr-only"
              onChange={(event) => addFiles(event.target.files)}
            />

            <IconCloudUpload
              size="1em"
              stroke={1.4}
              aria-hidden="true"
              className="text-[#111]"
              style={{ fontSize: "clamp(28px,3.1vw,45px)" }}
            />

            <p
              className={`mt-[clamp(6px,0.83vw,12px)] font-sans ${TEXT_16} font-semibold text-[#111]`}
            >
              Upload Photos / Videos
            </p>
            <p className={`mt-[clamp(2px,0.28vw,4px)] font-sans ${TEXT_13} text-[#8a8a8a]`}>
              Click or drag to upload
            </p>
            <p className={`mt-[clamp(1px,0.14vw,2px)] font-sans ${TEXT_13} text-[#8a8a8a]`}>
              (Up to {MAX_IMAGES} images or 1 video)
            </p>

            {files.length > 0 && (
              <ul className="mt-[clamp(8px,1.1vw,16px)] flex flex-wrap justify-center gap-[clamp(4px,0.55vw,8px)]">
                {files.map((file) => (
                  <li
                    key={file.name}
                    className={`flex max-w-full items-center gap-[0.45em] rounded-full bg-[#f4f4f4] py-[0.3em] pr-[0.35em] pl-[0.75em] font-sans ${TEXT_13} text-[#444]`}
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      // The label above is the file picker, so a click landing
                      // on this button must not also reopen it.
                      onClick={(event) => {
                        event.preventDefault();
                        setFiles((current) =>
                          current.filter((entry) => entry !== file),
                        );
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="flex aspect-square w-[1.35em] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#dcdcdc] text-[#444] transition-colors hover:bg-[#c8c8c8]"
                    >
                      <IconX size="0.8em" stroke={2.4} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
        </div>

        {/* Right: the written part of the review. */}
        <div className="flex flex-col">
          <div className="grid grid-cols-1 gap-[clamp(12px,2vw,29px)] sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor={`${fieldId}-title`}>Review Title</FieldLabel>
              <input
                id={`${fieldId}-title`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Summarize your experience"
                className={`mt-[clamp(5px,0.62vw,9px)] h-[clamp(32px,2.78vw,40px)] font-sans ${TEXT_14} ${FIELD}`}
              />
            </div>

            <div>
              <FieldLabel htmlFor={`${fieldId}-order`}>Order Number</FieldLabel>
              <input
                id={`${fieldId}-order`}
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="e.g. #TH12345"
                className={`mt-[clamp(5px,0.62vw,9px)] h-[clamp(32px,2.78vw,40px)] font-sans ${TEXT_14} ${FIELD}`}
              />
            </div>
          </div>

          <div className="mt-[clamp(12px,1.6vw,23px)] flex flex-1 flex-col">
            <FieldLabel htmlFor={`${fieldId}-body`}>Your Review</FieldLabel>
            <textarea
              id={`${fieldId}-body`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Tell others about the product, quality, fit, delivery etc."
              className={`mt-[clamp(5px,0.62vw,9px)] min-h-[clamp(88px,9vw,130px)] flex-1 resize-y py-[clamp(7px,0.76vw,11px)] font-sans ${TEXT_14} leading-[1.5] ${FIELD}`}
            />
          </div>
        </div>

        {/* Footer spans both columns. */}
        <div className="flex flex-col items-start gap-[clamp(12px,1.4vw,20px)] sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <p
            className={`flex items-start gap-[clamp(7px,0.83vw,12px)] font-sans ${TEXT_14} text-[#4f4f4f]`}
          >
            <IconLock
              size="1.35em"
              stroke={1.9}
              aria-hidden="true"
              className="mt-[0.05em] shrink-0"
              style={{ color: ORANGE }}
            />
            Thank you! All reviews are verified and help other customers choose
            better.
          </p>

          <button
            type="submit"
            className={`w-full shrink-0 cursor-pointer rounded-full py-[clamp(9px,1.1vw,16px)] font-sans ${TEXT_14} font-semibold uppercase tracking-[0.5px] text-white transition-opacity hover:opacity-90 sm:w-[clamp(180px,27.85vw,401px)]`}
            style={{ background: ORANGE }}
          >
            Submit Review
          </button>
        </div>

        {errors.length > 0 && (
          <ul
            role="alert"
            className={`font-sans ${TEXT_13} text-[#c0392b] lg:col-span-2`}
          >
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </form>
    </section>
  );
}
