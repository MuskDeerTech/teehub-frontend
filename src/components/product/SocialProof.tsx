import Link from "next/link";
import {
  IconBrandInstagram,
  IconChevronRight,
  IconCircleCheck,
  IconFlame,
  IconPackage,
  IconStarFilled,
} from "@tabler/icons-react";
import type { SocialProofChip } from "@/lib/products";

/** Chip icon key → glyph, keyed by the CMS select. */
const CHIP_ICONS = {
  fire: IconFlame,
  instagram: IconBrandInstagram,
  parcel: IconPackage,
  star: IconStarFilled,
} as const;

/**
 * The small pill row under the price — "54 Jerseys Sold Today", "Featured in
 * 4800+ Stories on Instagram ›", and so on. Editorial copy from the CMS; a chip
 * with an `href` becomes a link and grows the › affordance.
 */
export function SocialProofChips({ chips }: { chips: SocialProofChip[] }) {
  if (chips.length === 0) return null;

  return (
    <ul className="mt-3 flex flex-wrap items-stretch gap-1.5">
      {chips.map((chip) => {
        const Icon = CHIP_ICONS[chip.icon];
        const content = (
          <>
            <Icon
              size={13}
              stroke={1.8}
              aria-hidden="true"
              className="mt-px shrink-0 text-[#f36d43]"
            />
            <span className="min-w-0 flex-1 leading-[1.25]">{chip.text}</span>
            {chip.href && (
              <IconChevronRight
                size={12}
                stroke={2}
                aria-hidden="true"
                className="mt-px shrink-0 text-[#9a9a9a]"
              />
            )}
          </>
        );

        return (
          <li key={chip.text} className="min-w-0 flex-1">
            {chip.href ? (
              <Link
                href={chip.href}
                className="flex h-full items-start gap-1.5 rounded-md border border-[#efd9d0] bg-[#fdf6f3] px-2 py-1.5 text-[9px] font-medium text-[#5c5c5c] transition-colors hover:border-[#f36d43]"
              >
                {content}
              </Link>
            ) : (
              <span className="flex h-full items-start gap-1.5 rounded-md border border-[#efd9d0] bg-[#fdf6f3] px-2 py-1.5 text-[9px] font-medium text-[#5c5c5c]">
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The green prepaid box: the effective price when paying up front, plus the
 * incentive badge. Hidden entirely when the product has no prepaid price, since
 * the box is meaningless without its headline figure.
 */
export function PrepaidBox({
  price,
  note,
  badge,
}: {
  price?: number;
  note?: string;
  badge?: string;
}) {
  if (price == null) return null;

  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#cfe9da] bg-[#eef8f2] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <IconCircleCheck
          size={18}
          stroke={1.9}
          aria-hidden="true"
          className="shrink-0 text-[#0f7a45]"
        />
        <div className="min-w-0">
          <p className="text-[14px] font-bold leading-none text-[#0f7a45]">
            Get it @ ₹{price.toLocaleString("en-IN")}
          </p>
          {note && (
            <p className="mt-1 text-[9px] leading-tight text-[#6f8a7c]">
              {note}
            </p>
          )}
        </div>
      </div>

      {badge && (
        <span className="shrink-0 rounded border border-[#cfe9da] bg-white px-2 py-1 text-[8px] font-semibold leading-tight text-[#0f7a45]">
          {badge}
        </span>
      )}
    </div>
  );
}
