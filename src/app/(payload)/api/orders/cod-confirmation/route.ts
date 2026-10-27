import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Confirms a Cash on Delivery order before the return page shows success.
 *
 * The return page used to trust `?cod=1&order=…` in its own URL, so anyone
 * could type any order number into the address bar and get "Order placed
 * successfully". The page now asks here instead: the order has to exist, belong
 * to the signed-in customer, and actually be a COD order. Same rule as online
 * payments, where success only ever comes from /api/payments/hdfc/verify.
 */
function errorResponse(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || user.collection !== "customers") {
    return errorResponse("Sign in to view this order.", 401);
  }

  const body = (await request.json().catch(() => null)) as {
    orderNumber?: unknown;
  } | null;
  const orderNumber =
    typeof body?.orderNumber === "string" ? body.orderNumber.trim() : "";
  if (!/^[A-Za-z0-9-]{1,40}$/.test(orderNumber)) {
    return errorResponse("Invalid order number.");
  }

  const found = await payload.find({
    collection: "orders",
    where: {
      and: [
        { customer: { equals: user.id } },
        { orderNumber: { equals: orderNumber } },
        { "payment.method": { equals: "cod" } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const order = found.docs[0];
  // Someone else's order and a made-up number look the same from outside.
  if (!order) return errorResponse("Order not found.", 404);

  return Response.json({
    status: order.status === "cancelled" ? "failed" : "placed",
    orderNumber: order.orderNumber,
    amount: Number(order.totalPrice).toFixed(2),
    currency: order.currency,
  });
}
