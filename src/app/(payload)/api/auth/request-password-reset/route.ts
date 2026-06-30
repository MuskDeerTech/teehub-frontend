import config from "@payload-config";
import { getPayload } from "payload";
import {
  createPasswordResetCode,
  hashPasswordResetCode,
  passwordResetEmailHtml,
  passwordResetExpiry,
  PASSWORD_RESET_TTL_MINUTES,
} from "@/lib/auth/passwordReset";

function errorResponse(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

export async function POST(request: Request) {
  const { identifier, sendCode = true } = (await request.json()) as {
    identifier?: string;
    sendCode?: boolean;
  };
  const value = identifier?.trim();
  if (!value) return errorResponse("Enter your email or phone number.");

  const payload = await getPayload({ config });
  const emailOrPhone = value.toLowerCase();
  const digits = value.replace(/\D/g, "");
  const res = await payload.find({
    collection: "customers",
    where: value.includes("@")
      ? { email: { equals: emailOrPhone } }
      : {
          or: [
            { phone: { equals: value } },
            { phone: { equals: digits } },
          ],
        },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const account = res.docs[0];
  const email = account?.email?.trim().toLowerCase();

  if (!account || !email) {
    return errorResponse("No account found for that email or phone number.", 404);
  }

  if (sendCode) {
    const code = createPasswordResetCode();
    await payload.update({
      collection: "customers",
      id: account.id,
      data: {
        passwordResetCodeHash: hashPasswordResetCode(email, code),
        passwordResetExpiresAt: passwordResetExpiry(),
        passwordResetAttempts: 0,
      } as any,
      overrideAccess: true,
    });

    await payload.sendEmail({
      to: email,
      subject: "Set your new TeeHub password",
      html: passwordResetEmailHtml(code),
      text: `Your TeeHub password reset code is ${code}. It expires in ${PASSWORD_RESET_TTL_MINUTES} minutes.`,
    });
  }

  return Response.json({ email });
}
