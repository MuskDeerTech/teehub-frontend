import type { Payload } from "payload";
import type { Order } from "../../../payload-types";
import {
  HDFC_PAID_STATUS,
  HDFC_PENDING_STATUSES,
  getHdfcOrderStatus,
  hdfcCustomerId,
  sanitizedGatewayResponse,
  verifyHdfcStatus,
} from "@/lib/payments/hdfc";

export async function reconcileHdfcOrder(
  payload: Payload,
  order: Order,
  customerId: string | number,
) {
  const gatewayOrderId = order.payment?.gatewayOrderId;
  if (!gatewayOrderId) throw new Error("Order has no HDFC gateway order ID.");

  const gatewayStatus = await getHdfcOrderStatus(
    gatewayOrderId,
    hdfcCustomerId(customerId),
  );
  verifyHdfcStatus({
    expectedOrderId: gatewayOrderId,
    expectedAmount: Number(order.totalPrice ?? 0),
    status: gatewayStatus,
  });

  const paid = gatewayStatus.status === HDFC_PAID_STATUS;
  const pending = HDFC_PENDING_STATUSES.has(gatewayStatus.status);
  const paymentState = paid ? "paid" : pending ? "pending" : "failed";
  // The return page and the webhook both reconcile the same order, and a
  // customer refreshing the return page reconciles it again. Order emails hang
  // off this flag so they go out on the first transition into "paid" only.
  const becamePaid = paid && order.payment?.status !== "paid";
  const updated = await payload.update({
    collection: "orders",
    id: order.id,
    overrideAccess: true,
    depth: 0,
    data: {
      status: paid ? "confirmed" : pending ? order.status : "cancelled",
      payment: {
        ...order.payment,
        status: paymentState,
        transactionId: gatewayStatus.txn_id || order.payment?.transactionId,
        gatewayOrderId,
        gatewayStatus: gatewayStatus.status,
        verifiedAt: new Date().toISOString(),
        gatewayResponse: sanitizedGatewayResponse(gatewayStatus),
      },
    },
  });

  return { updated, paymentState, gatewayStatus: gatewayStatus.status, becamePaid };
}
