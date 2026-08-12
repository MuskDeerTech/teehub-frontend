import config from "@payload-config";
import { after } from "next/server";
import { getPayload } from "payload";
import type { Customer } from "../../../../../../payload-types";
import {
  CheckoutError,
  createCheckoutOrder,
  prepareCheckout,
  type CheckoutInput,
} from "@/lib/orders/checkout";
import { sendOrderEmails } from "@/lib/email/orderEmails";

function errorResponse(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

export async function POST(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || user.collection !== "customers") {
    return errorResponse("Sign in before placing an order.", 401);
  }

  try {
    const input = (await request.json()) as CheckoutInput;
    const checkout = await prepareCheckout(payload, user as Customer, input);
    const order = await createCheckoutOrder(payload, user as Customer, checkout, {
      method: "cod",
      title: "Cash on Delivery",
    });

    // A COD order is real the moment it is written, so both emails go out on
    // create. Deferred so a slow mail provider never delays the confirmation
    // the customer is waiting on.
    after(() => sendOrderEmails(payload, order));

    return Response.json({
      status: "confirmed",
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return errorResponse(error.message, error.status);
    }
    payload.logger.error(
      `Checkout order creation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return errorResponse("Could not place the order. Please try again.", 500);
  }
}
