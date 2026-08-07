import { IconStar, IconStarFilled, IconStarHalfFilled } from "@tabler/icons-react";

/**
 * A 1–5 star row. Renders halves so a 4.5 reads as four and a half stars
 * rather than rounding away the detail the score line already shows.
 */
export default function Stars({
  rating,
  size = 14,
  className = "",
  color = "#f5b301",
}: {
  rating: number;
  /** Number of px, or any CSS length — pass `"1em"` to let the row scale with
   *  the surrounding font size instead of being pinned to a pixel value. */
  size?: number | string;
  className?: string;
  /** Filled-star colour. Set inline rather than as a class so callers can
   *  override it without depending on Tailwind's rule order. */
  color?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-px ${className}`}
      style={{ color }}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((position) => {
        // A star is full at or below the score, half within 0.5 of it.
        if (rating >= position) {
          return <IconStarFilled key={position} size={size} aria-hidden="true" />;
        }
        if (rating >= position - 0.5) {
          return (
            <IconStarHalfFilled key={position} size={size} aria-hidden="true" />
          );
        }
        return (
          <IconStar
            key={position}
            size={size}
            stroke={1.6}
            aria-hidden="true"
            className="text-[#d9d9d9]"
          />
        );
      })}
    </span>
  );
}
