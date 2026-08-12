import { createHash, timingSafeEqual } from "node:crypto";
import config from "@payload-config";
import { after } from "next/server";
import { getPayload } from "payload";
import { HdfcGatewayError } from "@/lib/payments/hdfc";
import { reconcileHdfcOrder } from "@/lib/payments/reconcileHdfc";
import { sendOrderEmails } from "@/lib/email/orderEmails";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function authorized(request: Request) {
  const username = process.env.HDFC_SMARTGATEWAY_WEBHOOK_USERNAME;
  const password = process.env.HDFC_SMARTGATEWAY_WEBHOOK_PASSWORD;
  if (!username || !password) return false;

  const supplied = request.headers.get("authorization") || "";
  const expected = `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
  return safeEqual(supplied, expected);
}

export async function POST(request: Request) {
  if (
    !process.env.HDFC_SMARTGATEWAY_WEBHOOK_USERNAME ||
    !process.env.HDFC_SMARTGATEWAY_WEBHOOK_PASSWORD
  ) {
    return Response.json({ error: "Webhook authentication is not configured." }, { status: 503 });
  }
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rawBody = await request.text();
  let event: {
    id?: string;
    event_name?: string;
    content?: { order?: { order_id?: string } };
  } | null = null;
  try {
    event = JSON.parse(rawBody || "null");
  } catch {
    return Response.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  const gatewayOrderId = event?.content?.order?.order_id?.trim();
  if (!gatewayOrderId || !/^[A-Za-z0-9]{1,20}$/.test(gatewayOrderId)) {
    return Response.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const deliveryId = `hdfc:${
    event?.id || createHash("sha256").update(rawBody).digest("hex").slice(0, 32)
  }`;
  const previous = await payload.find({
    collection: "webhook-events",
    where: { deliveryId: { equals: deliveryId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (previous.docs[0]?.status === "processed") {
    return Response.json({ received: true });
  }

  const log = previous.docs[0]
    ? await payload.update({
        collection: "webhook-events",
        id: previous.docs[0].id,
        overrideAccess: true,
        depth: 0,
        data: {
          status: "received",
          attempts: (previous.docs[0].attempts ?? 1) + 1,
          error: null,
        },
      })
    : await payload.create({
        collection: "webhook-events",
        overrideAccess: true,
        depth: 0,
        data: {
          deliveryId,
          topic: event?.event_name || "HDFC_PAYMENT_EVENT",
          status: "received",
          payload: {
            gatewayOrderId,
            eventName: event?.event_name,
          },
        },
      });

  try {
    const found = await payload.find({
      collection: "orders",
      where: { "payment.gatewayOrderId": { equals: gatewayOrderId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const order = found.docs[0];
    const customerId =
      typeof order?.customer === "object" ? order.customer?.id : order?.customer;
    if (!order || !customerId) {
      await payload.update({
        collection: "webhook-events",
        id: log.id,
        overrideAccess: true,
        data: {
          status: "ignored",
          processedAt: new Date().toISOString(),
          error: "No matching local order.",
        },
      });
      return Response.json({ received: true });
    }

    const { updated, becamePaid } = await reconcileHdfcOrder(
      payload,
      order,
      customerId,
    );

    // Catches the customer who paid and closed the tab before the return page
    // could verify. Guarded, so a gateway retry of the same event is silent.
    if (becamePaid) after(() => sendOrderEmails(payload, updated));

    await payload.update({
      collection: "webhook-events",
      id: log.id,
      overrideAccess: true,
      data: { status: "processed", processedAt: new Date().toISOString(), error: null },
    });
    return Response.json({ received: true });
  } catch (error) {
    await payload.update({
      collection: "webhook-events",
      id: log.id,
      overrideAccess: true,
      data: {
        status: "failed",
        error: error instanceof Error ? error.message.slice(0, 1000) : "Unknown error",
      },
    });
    return Response.json(
      { error: "Could not verify payment event." },
      { status: error instanceof HdfcGatewayError ? error.status : 500 },
    );
  }
}
