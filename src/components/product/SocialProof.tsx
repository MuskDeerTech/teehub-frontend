import Link from "next/link";
import {
  IconBrandInstagram,
  IconChevronRight,
  IconFlame,
  IconPackage,
  IconPercentage,
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

/** Instagram keeps its own brand colour; everything else carries the store
 *  orange, matching the design. */
const CHIP_ICON_COLORS: Record<SocialProofChip["icon"], string> = {
  fire: "text-[#f36d43]",
  instagram: "text-[#e1306c]",
  parcel: "text-[#f36d43]",
  star: "text-[#f36d43]",
};

/**
 * Chip copy with the figure picked out, e.g. `*54* Jerseys Sold Today` renders
 * "54" bold orange and the rest plain — the emphasis the design puts on the
 * number.
 *
 * A marker inside the existing text field rather than a second field, so the CMS
 * needs no schema change. `split` with a capturing group hands back
 * [plain, marked, plain, marked, …], so the odd indices are the marked runs.
 */
function chipText(text: string) {
  return text.split(/\*([^*]+)\*/g).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-bold text-[#f36d43]">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

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
        // Centred against the icon, so a chip that wraps to two lines sits level
        // with its glyph instead of riding high.
        const content = (
          <>
            <Icon
              size={13}
              stroke={1.8}
              aria-hidden="true"
              className={`shrink-0 ${CHIP_ICON_COLORS[chip.icon]}`}
            />
            <span className="min-w-0 flex-1 leading-tight">
              {chipText(chip.text)}
            </span>
            {chip.href && (
              <IconChevronRight
                size={12}
                stroke={2}
                aria-hidden="true"
                className="shrink-0 text-[#9a9a9a]"
              />
            )}
          </>
        );

        return (
          <li key={chip.text} className="min-w-0 flex-1">
            {chip.href ? (
              <Link
                href={chip.href}
                className="flex h-full items-center gap-1.5 rounded-lg border border-[#efd9d0] bg-white px-2 py-1.5 text-[9px] font-medium text-[#5c5c5c] transition-colors hover:border-[#f36d43]"
              >
                {content}
              </Link>
            ) : (
              <span className="flex h-full items-center gap-1.5 rounded-lg border border-[#efd9d0] bg-white px-2 py-1.5 text-[9px] font-medium text-[#5c5c5c]">
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
        {/* Dark disc with a percent glyph, per the design — the old green tick
            read as "confirmed" rather than "here's a discount". */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#111]">
          <IconPercentage size={13} stroke={2.4} aria-hidden="true" className="text-white" />
        </span>
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
        <span className="shrink-0 rounded-lg border border-[#0f7a45]/40 bg-white px-2 py-1 text-[8px] font-semibold leading-tight text-[#0f7a45]">
          {badge}
        </span>
      )}
    </div>
  );
}
