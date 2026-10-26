import assert from "node:assert/strict";
import { after, test } from "node:test";
import { build } from "esbuild";

// Exercise the real verification route and gateway client without database,
// email, or bank side effects. No credentials are read from .env.
const { outputFiles } = await build({
  stdin: {
    contents: `export { POST } from './src/app/(payload)/api/payments/hdfc/verify/route.ts';
      export * from './src/lib/payments/hdfc.ts';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
  plugins: [{
    name: "payment-test-dependencies",
    setup(builder) {
      const mocks = {
        "@payload-config": "export default {};",
        payload: "export const getPayload = async () => globalThis.__hdfcTestPayload;",
        "next/server": "export const after = () => {};",
        "@/lib/email/orderEmails": "export const sendOrderEmails = async () => {};",
      };
      builder.onResolve({ filter: /^(?:@payload-config|payload|next\/server|@\/lib\/email\/orderEmails)$/ },
        ({ path }) => ({ path, namespace: "mock" }));
      builder.onLoad({ filter: /.*/, namespace: "mock" },
        ({ path }) => ({ contents: mocks[path], loader: "js" }));
    },
  }],
});
const gateway = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`);
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
Object.assign(process.env, {
  HDFC_SMARTGATEWAY_ENV: "uat",
  HDFC_SMARTGATEWAY_MERCHANT_ID: "testmerchant",
  HDFC_SMARTGATEWAY_API_KEY: "test-key",
  HDFC_SMARTGATEWAY_RETURN_URL: "https://example.test/checkout/payment/return",
  NODE_TLS_REJECT_UNAUTHORIZED: "1",
});
after(() => {
  globalThis.fetch = originalFetch;
  process.env = originalEnv;
  delete globalThis.__hdfcTestPayload;
});

test("order IDs are alphanumeric, under 21 characters, and distinct even at the same time", () => {
  const originalNow = Date.now;
  Date.now = () => 1793000000000;
  try {
    const ids = Array.from({ length: 10000 }, () => gateway.createHdfcOrderId());
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.every((id) => /^[A-Za-z0-9]{1,20}$/.test(id)));
  } finally {
    Date.now = originalNow;
  }
});

test("customer IDs are stable per account and distinct between accounts", () => {
  const ids = Array.from({ length: 10000 }, (_, id) => gateway.hdfcCustomerId(id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(gateway.hdfcCustomerId(42), gateway.hdfcCustomerId("42"));
});

test("session sends matching customer ID, exact amount, and no UDF2", async () => {
  const orderId = gateway.createHdfcOrderId();
  const customerId = gateway.hdfcCustomerId(42);
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "https://smartgateway.hdfcuat.bank.in/session");
    const body = JSON.parse(init.body);
    assert.equal(body.customer_id, customerId);
    assert.equal(init.headers["x-customerid"], customerId);
    assert.equal(body.order_id, orderId);
    assert.equal(body.amount, "1234.50");
    assert.equal(body.currency, "INR");
    assert.ok(!Object.keys(body).some((key) => key.toLowerCase() === "udf2"));
    return Response.json({ status: "NEW", order_id: orderId, payment_links: { web: "https://example.test/pay" } });
  };
  await gateway.createHdfcSession({ orderId, customerId, amount: 1234.5,
    email: "test@example.test", phone: "9999999999", fullName: "Test Customer" });
});

function verificationFixture(status = "CHARGED", overrides = {}) {
  const orderId = gateway.createHdfcOrderId();
  const order = { id: 1, orderNumber: "INTERNAL123", customer: 42, currency: "INR",
    totalPrice: 1234.5, status: "pending", payment: { gatewayOrderId: orderId, status: "pending" } };
  let updates = 0;
  globalThis.__hdfcTestPayload = {
    auth: async () => ({ user: { id: 42, collection: "customers" } }),
    find: async ({ where }) => {
      assert.deepEqual(where.and, [
        { customer: { equals: 42 } }, { "payment.gatewayOrderId": { equals: orderId } },
      ]);
      return { docs: [order] };
    },
    update: async ({ data }) => { updates++; return { ...order, ...data }; },
    logger: { error() {} },
  };
  globalThis.fetch = async (url, init) => {
    assert.equal(url, `https://smartgateway.hdfcuat.bank.in/orders/${orderId}`);
    assert.equal(init.method, "GET");
    assert.equal(init.headers["x-customerid"], gateway.hdfcCustomerId(42));
    return Response.json({ order_id: orderId, amount: "1234.50", currency: "INR",
      merchant_id: "testmerchant", status, ...overrides });
  };
  return { orderId, updates: () => updates, request: () => new Request("https://example.test/api/payments/hdfc/verify", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gatewayOrderId: orderId }),
  }) };
}

test("verified success returns gateway order ID and exact amount for the receipt", async () => {
  const fixture = verificationFixture();
  const response = await gateway.POST(fixture.request());
  assert.equal(response.status, 200);
  const receipt = await response.json();
  assert.equal(receipt.status, "paid");
  assert.equal(receipt.gatewayOrderId, fixture.orderId);
  assert.notEqual(receipt.gatewayOrderId, receipt.orderNumber);
  assert.equal(receipt.amount, "1234.50");
  assert.equal(receipt.currency, "INR");
  assert.equal(fixture.updates(), 1);
});

test("pending and failed payments are not reported as successful", async () => {
  for (const [bankStatus, expected] of [["NEW", "pending"], ["AUTHORIZATION_FAILED", "failed"]]) {
    const fixture = verificationFixture(bankStatus);
    const response = await gateway.POST(fixture.request());
    assert.equal((await response.json()).status, expected);
    assert.equal(fixture.updates(), 1);
  }
});

test("mismatched amount, order ID, currency, or merchant cannot produce a receipt", async () => {
  for (const overrides of [{ amount: "0.01" }, { order_id: "OTHER123" }, { currency: "USD" }, { merchant_id: "other" }]) {
    const fixture = verificationFixture("CHARGED", overrides);
    const response = await gateway.POST(fixture.request());
    assert.equal(response.status, 409);
    assert.equal(fixture.updates(), 0);
    assert.equal((await response.json()).gatewayOrderId, undefined);
  }
});
