/**
 * The reasons a customer may pick when raising an exchange from order history.
 *
 * Shared so the picker and the endpoint that validates the submission can never
 * drift apart — the reason is stored verbatim and shown back to the customer on
 * the order card, so anything not on this list has to be rejected rather than
 * written through. Staff are deliberately *not* held to it: `exchange.reason`
 * stays free text in the admin so they can word an unusual case themselves.
 */
export const EXCHANGE_REASONS = [
  "Size too small",
  "Size too large",
  "Wrong item received",
  "Damaged or defective",
  "Not as described",
] as const;

export type ExchangeReason = (typeof EXCHANGE_REASONS)[number];

export function isExchangeReason(value: unknown): value is ExchangeReason {
  return (
    typeof value === "string" &&
    (EXCHANGE_REASONS as readonly string[]).includes(value)
  );
}
