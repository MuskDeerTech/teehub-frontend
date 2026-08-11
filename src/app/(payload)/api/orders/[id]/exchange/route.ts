import config from "@payload-config";
import { getPayload } from "payload";
import { isExchangeReason } from "@/lib/orders/exchange";

/**
 * Raises an exchange against one line of the caller's own order.
 *
 * Orders are admin-only to write (see the Orders collection access), which is
 * deliberate — the public REST endpoint must not be able to edit an order. So
 * the request goes through here instead: ownership and eligibility are checked
 * against the caller's own read access first, and only then does the update run
 * with `overrideAccess`, touching nothing but the exchange fields.
 *
 * The result is always "pending". Accepting is a staff decision made in the
 * admin, which is what flips the strip on the order card from blue to green.
 */
function errorResponse(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    reason?: unknown;
    itemIndex?: unknown;
  } | null;

  const { reason, itemIndex } = body ?? {};
  if (!isExchangeReason(reason)) {
    return errorResponse("Choose a reason for the exchange.");
  }
  if (typeof itemIndex !== "number" || !Number.isInteger(itemIndex)) {
    return errorResponse("Choose which item you want to exchange.");
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || user.collection !== "customers") {
    return errorResponse("Sign in to request an exchange.", 401);
  }

  // Read as the customer, not as an admin: someone else's order fails the
  // collection's own access check and comes back as "not found" either way.
  const order = await payload
    .findByID({
      collection: "orders",
      id,
      depth: 0,
      user,
      overrideAccess: false,
    })
    .catch(() => null);

  if (!order) return errorResponse("Order not found.", 404);

  if (order.status !== "delivered") {
    return errorResponse(
      "You can request an exchange once the order has been delivered.",
      409,
    );
  }
  if (order.exchange?.state) {
    return errorResponse(
      "An exchange has already been raised for this order.",
      409,
    );
  }

  const items = order.items ?? [];
  if (!items[itemIndex]) {
    return errorResponse("That item isn't on this order.");
  }

  const updated = await payload.update({
    collection: "orders",
    id: order.id,
    depth: 0,
    overrideAccess: true,
    data: {
      // Spread what's there so a reference typed in ahead of time survives.
      // The Orders hook generates one when there isn't any.
      exchange: { ...order.exchange, state: "pending", reason },
      // Rewritten whole because Payload arrays are replaced, not patched. Each
      // row keeps its own `id`, so the existing rows are updated in place.
      items: items.map((item, index) =>
        index === itemIndex ? { ...item, exchanged: true } : item,
      ),
    },
  });

  return Response.json({ order: updated });
}
