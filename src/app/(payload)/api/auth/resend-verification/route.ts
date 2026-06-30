import config from "@payload-config";
import { getPayload } from "payload";
import {
  createVerificationCode,
  hashVerificationCode,
  verificationEmailHtml,
  verificationExpiry,
} from "@/lib/auth/emailVerification";

function errorResponse(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return errorResponse("Enter your email address.");

  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "customers",
    where: { email: { equals: normalizedEmail } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const account = res.docs[0];

  if (!account) return errorResponse("No account found for that email.", 404);
  if (account.emailVerified !== false) {
    return errorResponse("This email is already verified. Please sign in.", 409);
  }

  const code = createVerificationCode();
  await payload.update({
    collection: "customers",
    id: account.id,
    data: {
      emailVerificationCodeHash: hashVerificationCode(normalizedEmail, code),
      emailVerificationExpiresAt: verificationExpiry(),
      emailVerificationAttempts: 0,
    },
    overrideAccess: true,
  });

  await payload.sendEmail({
    to: normalizedEmail,
    subject: "Your TeeHub verification code",
    html: verificationEmailHtml(code),
    text: `Your TeeHub verification code is ${code}. It expires in 10 minutes.`,
  });

  return Response.json({ ok: true });
}
