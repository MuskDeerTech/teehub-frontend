import assert from "node:assert/strict";
import test from "node:test";
import {
  createWooSignature,
  verifyWooSignature,
} from "../src/lib/woocommerce/signature";

test("accepts a valid WooCommerce webhook signature", () => {
  const body = JSON.stringify({ id: 42, status: "processing" });
  const secret = "test-secret";
  assert.equal(
    verifyWooSignature(body, createWooSignature(body, secret), secret),
    true,
  );
});

test("rejects altered webhook bodies and signatures", () => {
  const body = JSON.stringify({ id: 42, status: "processing" });
  const signature = createWooSignature(body, "test-secret");
  assert.equal(
    verifyWooSignature(`${body} `, signature, "test-secret"),
    false,
  );
  assert.equal(verifyWooSignature(body, "invalid", "test-secret"), false);
  assert.equal(verifyWooSignature(body, null, "test-secret"), false);
});
