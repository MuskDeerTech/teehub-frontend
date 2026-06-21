import { createHmac, timingSafeEqual } from "crypto";

export function createWooSignature(rawBody: string, secret: string) {
  return createHmac("sha256", secret).update(rawBody).digest("base64");
}

export function verifyWooSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
) {
  if (!signature || !secret) return false;
  const expected = Buffer.from(createWooSignature(rawBody, secret));
  const received = Buffer.from(signature);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
