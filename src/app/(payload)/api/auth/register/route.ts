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

async function sendVerificationEmail({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  const payload = await getPayload({ config });
  await payload.sendEmail({
    to: email,
    subject: "Your TeeHub verification code",
    html: verificationEmailHtml(code),
    text: `Your TeeHub verification code is ${code}. It expires in 10 minutes.`,
  });
}

export async function POST(request: Request) {
  const { fullName, email, password, phone } = (await request.json()) as {
    fullName?: string;
    email?: string;
    password?: string;
    phone?: string;
  };

  const normalizedEmail = email?.trim().toLowerCase();
  if (!fullName?.trim()) return errorResponse("Please enter your full name.");
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return errorResponse("Please enter a valid email address.");
  }
  if (!password || password.length < 6) {
    return errorResponse("Password must be at least 6 characters.");
  }

  const code = createVerificationCode();
  const payload = await getPayload({ config });

  try {
    await payload.create({
      collection: "customers",
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        phone: phone?.trim() || undefined,
        emailVerified: false,
        emailVerificationCodeHash: hashVerificationCode(normalizedEmail, code),
        emailVerificationExpiresAt: verificationExpiry(),
        emailVerificationAttempts: 0,
      },
      overrideAccess: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return errorResponse(
      /invalid: ?email|already|duplicate|unique/i.test(message)
        ? "An account with this email already exists. Try signing in instead."
        : "Could not create account.",
      400,
    );
  }

  try {
    await sendVerificationEmail({ email: normalizedEmail, code });
  } catch (error) {
    payload.logger.error(
      `Verification email failed for ${normalizedEmail}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return errorResponse(
      "Account created, but the verification email could not be sent. Please try again.",
      500,
    );
  }

  return Response.json({ email: normalizedEmail, needsVerification: true });
}
