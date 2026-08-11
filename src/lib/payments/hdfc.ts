import { createHash, randomBytes } from "node:crypto";

const UAT_BASE_URL = "https://smartgateway.hdfcuat.bank.in";
const PRODUCTION_BASE_URL = "https://smartgateway.hdfc.bank.in";

export type HdfcSessionResponse = {
  status: string;
  id?: string;
  order_id: string;
  payment_links?: {
    web?: string;
    expiry?: string;
  };
};

export type HdfcOrderStatus = {
  status: string;
  status_id?: number;
  order_id: string;
  amount: number | string;
  currency?: string;
  merchant_id?: string;
  txn_id?: string;
  payment_method_type?: string;
  payment_method?: string;
  effective_amount?: number | string;
  error_code?: string | null;
  error_message?: string | null;
  bank_error_code?: string | null;
  bank_error_message?: string | null;
  payment_gateway_response?: {
    rrn?: string | null;
    epg_txn_id?: string | null;
    resp_code?: string | null;
    resp_message?: string | null;
  };
};

type HdfcConfig = {
  apiKey: string;
  baseUrl: string;
  clientId: string;
  merchantId: string;
  resellerId: string;
  returnUrl: string;
};

export class HdfcGatewayError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
    this.name = "HdfcGatewayError";
  }
}

function hdfcConfig(): HdfcConfig {
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
    throw new HdfcGatewayError(
      "Payment requests are disabled because TLS certificate verification is turned off on the server.",
      503,
    );
  }

  const merchantId = process.env.HDFC_SMARTGATEWAY_MERCHANT_ID?.trim();
  const apiKey = process.env.HDFC_SMARTGATEWAY_API_KEY?.trim();
  const isProduction =
    process.env.HDFC_SMARTGATEWAY_ENV?.trim().toLowerCase() === "production";
  const returnUrl = (
    process.env.HDFC_SMARTGATEWAY_RETURN_URL ||
    `${(process.env.NEXT_PUBLIC_SITE_URL || "https://teehubshop.com").replace(/\/$/, "")}/checkout/payment/return`
  ).trim();

  if (!merchantId || !apiKey) {
    throw new HdfcGatewayError(
      "HDFC SmartGateway is not configured on the server.",
      503,
    );
  }

  let parsedReturnUrl: URL;
  try {
    parsedReturnUrl = new URL(returnUrl);
  } catch {
    throw new HdfcGatewayError(
      "HDFC_SMARTGATEWAY_RETURN_URL must be a valid public HTTPS URL.",
      503,
    );
  }
  if (parsedReturnUrl.protocol !== "https:" || parsedReturnUrl.search) {
    throw new HdfcGatewayError(
      "HDFC_SMARTGATEWAY_RETURN_URL must use HTTPS and contain no query string.",
      503,
    );
  }

  return {
    merchantId,
    apiKey,
    baseUrl: isProduction ? PRODUCTION_BASE_URL : UAT_BASE_URL,
    clientId:
      process.env.HDFC_SMARTGATEWAY_CLIENT_ID?.trim() ||
      (isProduction ? merchantId : "hdfcmaster"),
    resellerId:
      process.env.HDFC_SMARTGATEWAY_RESELLER_ID?.trim() || "hdfc_reseller",
    returnUrl,
  };
}

function authorizationHeader(apiKey: string) {
  // HDFC Basic Auth is Base64(API key), without the conventional trailing
  // colon. This follows the SmartGateway Basic Auth documentation exactly.
  return `Basic ${Buffer.from(apiKey, "utf8").toString("base64")}`;
}

function headers(config: HdfcConfig, customerId: string) {
  return {
    Authorization: authorizationHeader(config.apiKey),
    "Content-Type": "application/json",
    "x-merchantid": config.merchantId,
    "x-customerid": customerId,
    "x-resellerid": config.resellerId,
  };
}

async function parseGatewayResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | (T & { error_message?: string; error?: string; error_code?: string })
    | null;

  if (!response.ok || !data) {
    const message =
      data?.error_message ||
      data?.error ||
      data?.error_code ||
      `HDFC SmartGateway returned HTTP ${response.status}.`;
    throw new HdfcGatewayError(message, response.status || 502);
  }

  return data;
}

async function gatewayFetch(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(url, { ...init, cache: "no-store", signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new HdfcGatewayError("HDFC SmartGateway timed out. Please retry.");
    }
    throw new HdfcGatewayError("Could not reach HDFC SmartGateway. Please retry.");
  } finally {
    clearTimeout(timeout);
  }
}

/** HDFC requires a non-sequential, alphanumeric order id under 21 chars. */
export function createHdfcOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(5).toString("hex").toUpperCase();
  return `TH${stamp}${random}`.slice(0, 20);
}

/** Stable, non-PII routing id used in both the header and request body. */
export function hdfcCustomerId(customerId: string | number) {
  return `THC${createHash("sha256").update(String(customerId)).digest("hex").slice(0, 16)}`;
}

export function assertHdfcConfigured() {
  hdfcConfig();
}

export async function createHdfcSession(input: {
  orderId: string;
  amount: number;
  customerId: string;
  email: string;
  phone: string;
  fullName: string;
}) {
  const config = hdfcConfig();
  const nameParts = input.fullName.trim().split(/\s+/);
  const firstName = nameParts.shift() || "Customer";
  const lastName = nameParts.join(" ") || ".";

  const response = await gatewayFetch(`${config.baseUrl}/session`, {
    method: "POST",
    headers: headers(config, input.customerId),
    body: JSON.stringify({
      order_id: input.orderId,
      amount: input.amount.toFixed(2),
      customer_id: input.customerId,
      customer_email: input.email,
      customer_phone: input.phone,
      payment_page_client_id: config.clientId,
      action: "paymentPage",
      currency: "INR",
      return_url: config.returnUrl,
      description: "Complete your TeeHub payment",
      first_name: firstName.slice(0, 50),
      last_name: lastName.slice(0, 50),
    }),
  });

  const session = await parseGatewayResponse<HdfcSessionResponse>(response);
  if (session.order_id !== input.orderId || !session.payment_links?.web) {
    throw new HdfcGatewayError(
      "HDFC SmartGateway returned an invalid payment session.",
    );
  }
  return session;
}

export async function getHdfcOrderStatus(
  orderId: string,
  customerId: string,
) {
  const config = hdfcConfig();
  const response = await gatewayFetch(
    `${config.baseUrl}/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: {
        ...headers(config, customerId),
        version: "2023-06-30",
      },
    },
  );
  return parseGatewayResponse<HdfcOrderStatus>(response);
}

export function verifyHdfcStatus(input: {
  expectedOrderId: string;
  expectedAmount: number;
  status: HdfcOrderStatus;
}) {
  const config = hdfcConfig();
  const actualAmount = Number(input.status.amount);
  if (
    input.status.order_id !== input.expectedOrderId ||
    !Number.isFinite(actualAmount) ||
    Math.abs(actualAmount - input.expectedAmount) > 0.009 ||
    (input.status.currency && input.status.currency !== "INR") ||
    (input.status.merchant_id && input.status.merchant_id !== config.merchantId)
  ) {
    throw new HdfcGatewayError(
      "Payment verification failed because the gateway order details did not match.",
      409,
    );
  }
}

export function sanitizedGatewayResponse(status: HdfcOrderStatus) {
  return {
    status: status.status,
    statusId: status.status_id,
    amount: status.amount,
    currency: status.currency,
    transactionId: status.txn_id,
    paymentMethodType: status.payment_method_type,
    paymentMethod: status.payment_method,
    errorCode: status.error_code || status.bank_error_code,
    errorMessage: status.error_message || status.bank_error_message,
    rrn: status.payment_gateway_response?.rrn,
    gatewayTransactionId: status.payment_gateway_response?.epg_txn_id,
    gatewayResponseCode: status.payment_gateway_response?.resp_code,
    gatewayResponseMessage: status.payment_gateway_response?.resp_message,
  };
}

export const HDFC_PAID_STATUS = "CHARGED";
export const HDFC_PENDING_STATUSES = new Set([
  "NEW",
  "PENDING_VBV",
  "AUTHORIZING",
  "STARTED",
]);
