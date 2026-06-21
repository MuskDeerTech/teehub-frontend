import { createHash } from "crypto";
import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { WooCommerceClient } from "@/lib/woocommerce/client";
import {
  cancelWooOrder,
  syncCustomer,
  syncOrder,
} from "@/lib/woocommerce/sync";
import { verifyWooSignature } from "@/lib/woocommerce/signature";
import type { WooOrder } from "@/lib/woocommerce/types";

type Doc = Record<string, unknown> & { id: string | number };
type EventPayload = {
  find(args: Record<string, unknown>): Promise<{ docs: Doc[] }>;
  create(args: Record<string, unknown>): Promise<Doc>;
  update(args: Record<string, unknown>): Promise<Doc>;
};

const events = (payload: Payload) => payload as unknown as EventPayload;

async function findEvent(payload: Payload, deliveryId: string) {
  const result = await events(payload).find({
    collection: "webhook-events",
    where: { deliveryId: { equals: deliveryId } },
    limit: 1,
    overrideAccess: true,
  });
  return result.docs[0];
}

export async function POST(request: Request) {
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return Response.json(
      { error: "Webhook secret is not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  if (
    !verifyWooSignature(
      rawBody,
      request.headers.get("x-wc-webhook-signature"),
      secret,
    )
  ) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  const topic = request.headers.get("x-wc-webhook-topic") || "unknown";
  const deliveryId =
    request.headers.get("x-wc-webhook-delivery-id") ||
    createHash("sha256").update(`${topic}:${rawBody}`).digest("hex");
  const body = JSON.parse(rawBody) as WooOrder;
  const payload = await getPayload({ config });
  const existing = await findEvent(payload, deliveryId);

  if (existing?.status === "processed" || existing?.status === "ignored") {
    return Response.json({ ok: true, duplicate: true });
  }

  const event = existing
    ? await events(payload).update({
        collection: "webhook-events",
        id: existing.id,
        data: {
          status: "received",
          error: null,
          attempts: Number(existing.attempts ?? 1) + 1,
          payload: body,
        },
        overrideAccess: true,
      })
    : await events(payload).create({
        collection: "webhook-events",
        data: {
          deliveryId,
          topic,
          resourceId: body.id,
          status: "received",
          attempts: 1,
          payload: body,
        },
        overrideAccess: true,
      });

  try {
    if (!topic.startsWith("order.")) {
      await events(payload).update({
        collection: "webhook-events",
        id: event.id,
        data: { status: "ignored", processedAt: new Date().toISOString() },
        overrideAccess: true,
      });
      return Response.json({ ok: true, ignored: true });
    }

    if (topic === "order.deleted") {
      await cancelWooOrder(payload, body.id);
    } else {
      const woo = WooCommerceClient.fromEnv();
      const order = await woo.getOrder(body.id);
      await syncOrder(payload, order);
      if (order.customer_id) {
        try {
          await syncCustomer(
            payload,
            await woo.getCustomer(order.customer_id),
          );
        } catch (error) {
          payload.logger.warn(
            `Order ${order.id} synced, but customer ${order.customer_id} metrics could not be refreshed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    await events(payload).update({
      collection: "webhook-events",
      id: event.id,
      data: { status: "processed", processedAt: new Date().toISOString() },
      overrideAccess: true,
    });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await events(payload).update({
      collection: "webhook-events",
      id: event.id,
      data: {
        status: "failed",
        error: message,
        processedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    return Response.json({ error: message }, { status: 500 });
  }
}
