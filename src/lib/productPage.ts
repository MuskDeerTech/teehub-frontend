/**
 * Store-wide product-page furniture: the offer tiles, the trust-badge strip and
 * the delivery estimate. Identical on every product, so it's one global read
 * rather than fields repeated per product.
 *
 * Same shape as the other lib modules — Payload docs in, plain typed objects
 * out, with `null` collapsed to `undefined` at the boundary.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { ProductPage as ProductPageDoc } from "../../payload-types";

export type Offer = {
  /** ₹ taken off. */
  amountOff: number;
  /** ₹ the basket has to reach to qualify. */
  minSpend: number;
};

export type TrustBadge = {
  icon: "return" | "delivery" | "cod" | "shield";
  title: string;
  subtitle?: string;
};

export type ProductPageSettings = {
  offersTitle: string;
  offers: Offer[];
  trustBadges: TrustBadge[];
  deliveryLabel: string;
  /** Days from today; the component turns this into a real date. */
  deliveryLeadDays: number;
  taxNote: string;
  /** Digits with country code, or undefined when the button should be hidden. */
  whatsappNumber?: string;
  /** Store defaults for the accordions; a product can override either. */
  washCare?: string;
  shipping?: string;
};

const DEFAULTS: ProductPageSettings = {
  offersTitle: "Available Offers",
  offers: [],
  trustBadges: [],
  deliveryLabel: "FAST DELIVERY",
  deliveryLeadDays: 7,
  taxNote: "Inclusive of all taxes",
};

function textOr(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export async function getProductPageSettings(): Promise<ProductPageSettings> {
  const payload = await getPayload({ config });
  const doc = (await payload.findGlobal({
    slug: "product-page",
    depth: 0,
  })) as ProductPageDoc;

  return {
    offersTitle: textOr(doc.offersTitle, DEFAULTS.offersTitle),
    offers: (doc.offers ?? [])
      .filter((offer) => offer.isActive !== false)
      .map((offer) => ({ amountOff: offer.amountOff, minSpend: offer.minSpend })),
    trustBadges: (doc.trustBadges ?? [])
      .filter((badge) => badge.isActive !== false)
      .map((badge) => ({
        icon: badge.icon,
        title: badge.title,
        subtitle: badge.subtitle ?? undefined,
      })),
    deliveryLabel: textOr(doc.deliveryLabel, DEFAULTS.deliveryLabel),
    deliveryLeadDays: doc.deliveryLeadDays ?? DEFAULTS.deliveryLeadDays,
    taxNote: textOr(doc.taxNote, DEFAULTS.taxNote),
    whatsappNumber: doc.whatsappNumber?.replace(/\D/g, "") || undefined,
    washCare: doc.washCare?.trim() || undefined,
    shipping: doc.shipping?.trim() || undefined,
  };
}

/**
 * The delivery estimate, resolved on the server so the date can't differ
 * between the server render and the client's clock/timezone.
 *
 * Formatted as "29th July" to match the design — `Intl` has no ordinal-day
 * pattern, so the suffix is applied by hand.
 */
export function deliveryDateLabel(leadDays: number, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + leadDays);

  const day = date.getDate();
  const month = date.toLocaleDateString("en-IN", { month: "long" });
  return `${day}${ordinalSuffix(day)} ${month}`;
}

/** 1st, 2nd, 3rd, 4th … with the 11–13 exception. */
function ordinalSuffix(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
