import config from "@payload-config";
import { getPayload } from "payload";
import type { Customer, Order } from "../../../../../../../payload-types";
import {
  CheckoutError,
  createCheckoutOrder,
  prepareCheckout,
  type CheckoutInput,
} from "@/lib/orders/checkout";
import {
  HdfcGatewayError,
  assertHdfcConfigured,
  createHdfcOrderId,
  createHdfcSession,
  hdfcCustomerId,
} from "@/lib/payments/hdfc";

function errorResponse(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || user.collection !== "customers") {
    return errorResponse("Sign in before continuing to payment.", 401);
  }

  let createdOrder: Order | undefined;
  try {
    assertHdfcConfigured();
    const input = (await request.json()) as CheckoutInput;
    const checkout = await prepareCheckout(payload, user as Customer, input);
    const gatewayOrderId = createHdfcOrderId();
    const routingCustomerId = hdfcCustomerId(user.id);
    const order = await createCheckoutOrder(payload, user as Customer, checkout, {
      method: checkout.paymentMethod,
      title: "HDFC SmartGateway",
      gatewayOrderId,
    });
    createdOrder = order;

    const session = await createHdfcSession({
      orderId: gatewayOrderId,
      amount: checkout.totals.totalPrice,
      customerId: routingCustomerId,
      email: checkout.customer.email,
      phone: checkout.customer.phone,
      fullName: checkout.customer.fullName,
    });

    await payload.update({
      collection: "orders",
      id: order.id,
      overrideAccess: true,
      depth: 0,
      data: {
        payment: {
          ...order.payment,
          gatewayOrderId,
          gatewayStatus: session.status,
          gatewayResponse: {
            sessionId: session.id,
            paymentLinkExpiry: session.payment_links?.expiry,
          },
        },
      },
    });

    return Response.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      gatewayOrderId,
      paymentUrl: session.payment_links!.web,
    });
  } catch (error) {
    if (createdOrder) {
      await payload
        .update({
          collection: "orders",
          id: createdOrder.id,
          overrideAccess: true,
          depth: 0,
          data: {
            status: "cancelled",
            payment: {
              ...createdOrder.payment,
              status: "failed",
              title: "HDFC SmartGateway",
              gatewayStatus: "SESSION_FAILED",
            },
          },
        })
        .catch(() => undefined);
    }

    if (error instanceof CheckoutError || error instanceof HdfcGatewayError) {
      return errorResponse(error.message, error.status);
    }
    payload.logger.error(
      `HDFC session creation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return errorResponse("Could not start the payment. Please try again.", 500);
  }
}
