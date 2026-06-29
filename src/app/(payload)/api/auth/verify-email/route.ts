import config from "@payload-config";
import { getPayload } from "payload";
import {
  isVerificationCodeMatch,
  normalizeVerificationCode,
} from "@/lib/auth/emailVerification";

function errorResponse(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

function authCookie({
  request,
  token,
  exp,
}: {
  request: Request;
  token: string;
  exp?: number;
}) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttps =
    forwardedProto === "https" || new URL(request.url).protocol === "https:";
  const maxAge = exp
    ? Math.max(0, exp - Math.floor(Date.now() / 1000))
    : undefined;

  return [
    `payload-token=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    maxAge !== undefined ? `Max-Age=${maxAge}` : "",
    isHttps ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export async function POST(request: Request) {
  const { email, code, password } = (await request.json()) as {
    email?: string;
    code?: string;
    password?: string;
  };

  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedCode = normalizeVerificationCode(code ?? "");
  if (!normalizedEmail || !normalizedCode || !password) {
    return errorResponse("Enter the verification code sent to your email.");
  }
  if (normalizedCode.length !== 6) {
    return errorResponse("Enter the 6-digit verification code.");
  }

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

  const attempts = Number(account.emailVerificationAttempts ?? 0);
  if (attempts >= 5) {
    return errorResponse("Too many attempts. Please request a new code.", 429);
  }

  const expiresAt = account.emailVerificationExpiresAt
    ? new Date(account.emailVerificationExpiresAt).getTime()
    : 0;
  if (!expiresAt || expiresAt < Date.now()) {
    return errorResponse("That code has expired. Please request a new one.", 410);
  }

  const isMatch = isVerificationCodeMatch({
    email: normalizedEmail,
    code: normalizedCode,
    hash: account.emailVerificationCodeHash,
  });

  if (!isMatch) {
    await payload.update({
      collection: "customers",
      id: account.id,
      data: { emailVerificationAttempts: attempts + 1 },
      overrideAccess: true,
    });
    return errorResponse("That code is not correct.", 401);
  }

  await payload.update({
    collection: "customers",
    id: account.id,
    data: {
      emailVerified: true,
      emailVerificationCodeHash: null,
      emailVerificationExpiresAt: null,
      emailVerificationAttempts: 0,
    },
    overrideAccess: true,
  });

  let result: Awaited<ReturnType<typeof payload.login>>;
  try {
    result = await payload.login({
      collection: "customers",
      data: { email: normalizedEmail, password },
    });
  } catch {
    return errorResponse("Email verified. Please sign in.", 200);
  }

  if (!result.token) return errorResponse("Email verified. Please sign in.", 200);

  const response = Response.json({ user: result.user });
  response.headers.set(
    "Set-Cookie",
    authCookie({ request, token: result.token, exp: result.exp }),
  );
  return response;
}
