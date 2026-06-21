import { createHmac, timingSafeEqual } from "crypto";

export function createWooSignature(rawBody: string, secret: string) {
  return createHmac("sha256", secret).update(rawBody).digest("base64");
}

export function verifyWooSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
) {
  const normalizedSecret = secret.trim();
  const normalizedSignature = signature?.trim();
  if (!normalizedSignature || !normalizedSecret) return false;

  try {
    const expected = Buffer.from(
      createWooSignature(rawBody, normalizedSecret),
      "base64",
    );
    const received = Buffer.from(normalizedSignature, "base64");
    return (
      expected.length === received.length &&
      timingSafeEqual(expected, received)
    );
  } catch {
    return false;
  }
}
