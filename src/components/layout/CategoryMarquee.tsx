import Image from "next/image";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * EDIT THIS CONFIG to tune the strip's height, spacing and scroll speed.
 * `durationSec` is how long one full copy of the list takes to scroll past —
 * raise it to slow the marquee down.
 * ─────────────────────────────────────────────────────────────────────────
 */
const config = {
  /** Navy from the design. */
  bg: "#000080",
  /** Strip height, in px. */
  height: 56,
  /** Rendered icon size, in px (the source SVGs are 32×32). */
  iconSize: 24,
  /** Space between an icon and its own label, in px. */
  iconGap: 6,
  /** Space between items. Also used at every copy seam, so the
   *  seam is spaced identically to everything else and the loop is invisible. */
  itemGap: 28,
  /** Seconds for one full copy of the list to pass. Higher = slower. */
  durationSec: 30,
} as const;

type MarqueeItem = {
  label: string;
  /** Optional while the artwork is still being made — an item with no icon
   *  renders as label-only rather than leaving a gap. */
  icon?: string;
};

/**
 * The strip's items, in design order. Icons live in `/public/svg/marquee/`.
 * These are deliberately not links yet — the destinations aren't decided, and
 * the labels don't map onto the existing category slugs — so they render as
 * plain text and stay out of the tab order.
 */
const items: MarqueeItem[] = [
  { label: "CUSTOM FOOTBALL JERSEYS", icon: "/svg/marquee/custom-football-jerseys.svg" },
  { label: "CUSTOM CRICKET JERSEYS", icon: "/svg/marquee/custom-cricket-jerseys.svg" },
  { label: "CUSTOM POLOS", icon: "/svg/marquee/custom-polos.svg" },
  { label: "PREMIUM HOODIES", icon: "/svg/marquee/premium-hoodies.svg" },
  { label: "DESIGN YOUR OWN", icon: "/svg/marquee/design-your-own.svg" },
  { label: "FAST DELIVERY", icon: "/svg/marquee/fast-delivery.svg" },
  { label: "CASH ON DELIVERY", icon: "/svg/marquee/cash-on-delivery.svg" },
  { label: "TRUSTED BY 15,000+ CUSTOMERS" },
  { label: "MADE IN INDIA" },
];

/** Extra copies keep the track wider than large desktop viewports throughout
 * the animation. The track still advances by exactly one copy per cycle. */
const MARQUEE_COPIES = 4;

/** One copy of the list. Repeated copies are presentational so screen readers
 * announce the strip only once. */
function MarqueeRow({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      className="flex w-max shrink-0 items-center"
      style={{ gap: config.itemGap, paddingRight: config.itemGap }}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center whitespace-nowrap"
          style={{ gap: config.iconGap }}
        >
          {/* Decorative: the label right next to it already carries the meaning. */}
          {item.icon && (
            <Image
              src={item.icon}
              alt=""
              width={config.iconSize}
              height={config.iconSize}
              className="shrink-0"
            />
          )}
          <span className="font-navbar text-[13px] font-semibold uppercase tracking-[0.3px] text-white">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The navy category strip that sits under the navbar. It scrolls continuously
 * right-to-left and is wider than the viewport by design.
 *
 * Sits in normal flow (the navbar above it is the sticky one), so it scrolls
 * away with the page.
 */
export default function CategoryMarquee() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: config.bg, height: config.height }}
    >
      {/* The copies scroll as one track. The animation advances by exactly one
          copy, while the extras keep wide viewports covered throughout the
          cycle. */}
      <div
        className="marquee-track flex h-full w-max"
        style={
          {
            "--marquee-duration": `${config.durationSec}s`,
            "--marquee-shift": `${-100 / MARQUEE_COPIES}%`,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: MARQUEE_COPIES }, (_, index) => (
          <MarqueeRow key={index} duplicate={index > 0} />
        ))}
      </div>
    </div>
  );
}
