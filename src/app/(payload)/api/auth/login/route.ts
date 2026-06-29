import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Login with email OR phone number against the email/password `customers` auth.
 *
 * Email goes straight through. A phone number is resolved to its account's
 * email server-side (with overrideAccess, since unauthenticated users can't
 * read customers), then we call Payload's Local API `login` directly.
 *
 * We deliberately do NOT proxy to Payload's REST `/api/customers/login` via
 * `fetch`. A same-origin self-fetch works in local dev but fails in production
 * behind a reverse proxy (the server can't reliably reach its own public host),
 * which surfaces as a 500. The Local API runs in-process, so it has no such
 * dependency. The JWT it returns is the same one Payload's REST login mints —
 * we set it as the standard HTTP-only `payload-token` cookie.
 */
export async function POST(request: Request) {
  const { identifier, password } = (await request.json()) as {
    identifier?: string;
    password?: string;
  };
  const value = identifier?.trim();
  if (!value || !password) {
    return Response.json(
      { errors: [{ message: "Enter your email/phone and password." }] },
      { status: 400 },
    );
  }

  const payload = await getPayload({ config });
  let email = value.toLowerCase();
  let account:
    | {
        email?: string | null;
        emailVerified?: boolean | null;
      }
    | undefined;

  if (!value.includes("@")) {
    // Treat as a phone number; match on the raw value or its digits only.
    const digits = value.replace(/\D/g, "");
    const res = await payload.find({
      collection: "customers",
      where: {
        or: [{ phone: { equals: value } }, { phone: { equals: digits } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    account = res.docs[0];
    if (!account?.email) {
      return Response.json(
        { errors: [{ message: "No account found for that phone number." }] },
        { status: 401 },
      );
    }
    email = String(account.email).toLowerCase();
  } else {
    const res = await payload.find({
      collection: "customers",
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    account = res.docs[0];
  }

  if (account?.emailVerified === false) {
    return Response.json(
      {
        code: "EMAIL_NOT_VERIFIED",
        email,
        errors: [{ message: "Please verify your email before signing in." }],
      },
      { status: 403 },
    );
  }

  let result: Awaited<ReturnType<typeof payload.login>>;
  try {
    result = await payload.login({
      collection: "customers",
      data: { email, password },
    });
  } catch {
    return Response.json(
      { errors: [{ message: "Invalid login or password." }] },
      { status: 401 },
    );
  }

  if (!result.token) {
    return Response.json(
      { errors: [{ message: "Invalid login or password." }] },
      { status: 401 },
    );
  }

  // Mirror the cookie Payload's REST login would set. `exp` is in seconds.
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttps =
    forwardedProto === "https" || new URL(request.url).protocol === "https:";
  const maxAge = result.exp
    ? Math.max(0, result.exp - Math.floor(Date.now() / 1000))
    : undefined;
  const cookie = [
    `payload-token=${result.token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    maxAge !== undefined ? `Max-Age=${maxAge}` : "",
    isHttps ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  const response = Response.json({ user: result.user });
  response.headers.set("Set-Cookie", cookie);
  return response;
}
