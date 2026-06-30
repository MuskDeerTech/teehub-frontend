import { createHash, randomInt, timingSafeEqual } from "crypto";

const CODE_TTL_MINUTES = 10;

export function createVerificationCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function verificationExpiry() {
  return new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();
}

export function hashVerificationCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${email.trim().toLowerCase()}:${code}:${process.env.PAYLOAD_SECRET ?? ""}`)
    .digest("hex");
}

export function isVerificationCodeMatch({
  email,
  code,
  hash,
}: {
  email: string;
  code: string;
  hash?: string | null;
}) {
  if (!hash) return false;

  try {
    const expected = Buffer.from(hashVerificationCode(email, code), "hex");
    const received = Buffer.from(hash, "hex");
    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

export function normalizeVerificationCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    "https://www.teehubshop.com"
  ).replace(/\/+$/, "");
}

export function verificationEmailHtml(code: string) {
  const logoUrl = `${siteUrl()}/images/teehub-logo.png`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;background:#f4f4f4;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;color:#111111;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #eeeeee;">
            <tr>
              <td align="center" style="padding:28px 28px 18px;background:#ffffff;">
                <img src="${logoUrl}" width="150" alt="TeeHub" style="display:block;width:150px;max-width:70%;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 30px;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#f26522;">Account verification</p>
                <h1 style="margin:0;color:#111111;font-size:26px;line-height:1.25;font-weight:800;">Verify your email</h1>
                <p style="margin:14px 0 22px;color:#666666;font-size:15px;line-height:1.6;">
                  Enter this code in TeeHub to finish creating your account and continue shopping.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 auto 22px;">
                  <tr>
                    <td align="center" style="background:#fff4ee;border:1px solid #ffd9c8;border-radius:14px;padding:18px 12px;">
                      <span style="display:inline-block;color:#111111;font-size:34px;line-height:1;font-weight:800;letter-spacing:8px;">${code}</span>
                    </td>
                  </tr>
                </table>

                <p style="margin:0;color:#666666;font-size:13px;line-height:1.55;">
                  This code expires in <strong style="color:#111111;">${CODE_TTL_MINUTES} minutes</strong>. If you did not create a TeeHub account, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#111111;text-align:center;">
                <p style="margin:0;color:#ffffff;font-size:13px;font-weight:700;">TeeHub</p>
                <p style="margin:6px 0 0;color:#bdbdbd;font-size:12px;line-height:1.5;">Premium sports jerseys, hoodies and polos.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}
