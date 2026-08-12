import config from "@payload-config";
import { after } from "next/server";
import { getPayload } from "payload";
import {
  HdfcGatewayError,
} from "@/lib/payments/hdfc";
import { reconcileHdfcOrder } from "@/lib/payments/reconcileHdfc";
import { sendOrderEmails } from "@/lib/email/orderEmails";

function errorResponse(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || user.collection !== "customers") {
    return errorResponse("Sign in to verify this payment.", 401);
  }

  const body = (await request.json().catch(() => null)) as {
    gatewayOrderId?: unknown;
  } | null;
  const gatewayOrderId =
    typeof body?.gatewayOrderId === "string" ? body.gatewayOrderId.trim() : "";
  if (!/^[A-Za-z0-9]{1,20}$/.test(gatewayOrderId)) {
    return errorResponse("Invalid payment order ID.");
  }

  const found = await payload.find({
    collection: "orders",
    where: {
      and: [
        { customer: { equals: user.id } },
        { "payment.gatewayOrderId": { equals: gatewayOrderId } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const order = found.docs[0];
  if (!order) return errorResponse("Payment order not found.", 404);

  try {
    const { updated, paymentState, gatewayStatus, becamePaid } =
      await reconcileHdfcOrder(payload, order, user.id);

    // Only on the first transition into "paid" — this route is polled while the
    // bank decides, and the customer can refresh the return page at will.
    if (becamePaid) after(() => sendOrderEmails(payload, updated));

    return Response.json({
      status: paymentState,
      gatewayStatus,
      orderId: updated.id,
      orderNumber: updated.orderNumber,
    });
  } catch (error) {
    if (error instanceof HdfcGatewayError) {
      return errorResponse(error.message, error.status);
    }
    payload.logger.error(
      `HDFC payment verification failed for ${gatewayOrderId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return errorResponse("Could not verify the payment. Please retry.", 500);
  }
}
