import { IconStar, IconStarFilled, IconStarHalfFilled } from "@tabler/icons-react";

/**
 * A 1–5 star row. Renders halves so a 4.5 reads as four and a half stars
 * rather than rounding away the detail the score line already shows.
 */
export default function Stars({
  rating,
  size = 14,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-px text-[#f5b301] ${className}`}
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
