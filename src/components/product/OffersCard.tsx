import {
  IconArrowBackUp,
  IconCash,
  IconDiscount2,
  IconShieldCheck,
  IconTruckDelivery,
} from "@tabler/icons-react";
import type { Offer, TrustBadge } from "@/lib/productPage";

/** Trust-badge icon key → glyph. Keyed by the CMS select so a new option only
 *  needs a line here. */
const BADGE_ICONS = {
  return: IconArrowBackUp,
  delivery: IconTruckDelivery,
  cod: IconCash,
  shield: IconShieldCheck,
} as const;

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * The "Available Offers" card and the green trust strip beneath it. Both are
 * store-wide (see the `product-page` global), so every product page renders the
 * same tiles — the component takes them as props rather than fetching, keeping
 * it usable from the client-side info panel.
 */
export default function OffersCard({
  title,
  offers,
  trustBadges,
}: {
  title: string;
  offers: Offer[];
  trustBadges: TrustBadge[];
}) {
  // Nothing configured yet — render nothing rather than an empty chrome box.
  if (offers.length === 0 && trustBadges.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#e2e2e2] bg-white p-4">
      {offers.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <IconDiscount2
              size={20}
              stroke={1.8}
              aria-hidden="true"
              className="text-[#111]"
            />
            <h2 className="text-[15px] font-semibold text-[#111]">{title}</h2>
          </div>

          {/* One segmented strip rather than separate tiles: the design draws a
              single bordered box split by vertical hairlines. Columns are set
              off the offer count (same as the trust strip below) so they always
              sit on one row instead of wrapping at four. */}
          <div
            className="mt-3 grid overflow-hidden rounded-lg border border-[#f6c9b8] bg-[#fdf1ec]"
            style={{
              gridTemplateColumns: `repeat(${offers.length}, minmax(0, 1fr))`,
            }}
          >
            {offers.map((offer, index) => (
              <div
                key={`${offer.amountOff}-${offer.minSpend}`}
                className={`px-2 py-3 text-center ${
                  index > 0 ? "border-l border-[#f6c9b8]" : ""
                }`}
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.4px] text-[#8a8a8a]">
                  Get
                </p>
                <p className="mt-0.5 text-[15px] font-bold leading-none text-[#111]">
                  {inr(offer.amountOff)} OFF
                </p>
                <p className="mt-1.5 text-[9px] leading-tight text-[#8a8a8a]">
                  on purchase of {inr(offer.minSpend)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {trustBadges.length > 0 && (
        <div
          className={`grid gap-2 rounded-lg border border-[#cfe9da] bg-[#eef8f2] p-3 ${
            offers.length > 0 ? "mt-3" : ""
          }`}
          style={{
            gridTemplateColumns: `repeat(${trustBadges.length}, minmax(0, 1fr))`,
          }}
        >
          {trustBadges.map((badge) => {
            const Icon = BADGE_ICONS[badge.icon];
            return (
              <div
                key={badge.title}
                className="flex flex-col items-center gap-1 text-center"
              >
                {/* Outlined circle around the glyph, matching the design. */}
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0f7a45]/35 text-[#0f7a45]">
                  <Icon size={15} stroke={1.7} aria-hidden="true" />
                </span>
                <p className="text-[11px] font-semibold leading-tight text-[#111]">
                  {badge.title}
                </p>
                {badge.subtitle && (
                  <p className="text-[9px] leading-tight text-[#6f8a7c]">
                    {badge.subtitle}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
