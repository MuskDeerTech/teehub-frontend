import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Login with email OR phone number against the email/password `customers` auth.
 *
 * Email goes straight through. A phone number is resolved to its account's
 * email server-side (with overrideAccess, since unauthenticated users can't
 * read customers), then we proxy to Payload's own `/login` so the secure
 * HTTP-only cookie is minted by Payload itself — we never forge it.
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

  let email = value.toLowerCase();

  if (!value.includes("@")) {
    // Treat as a phone number; match on the raw value or its digits only.
    const digits = value.replace(/\D/g, "");
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "customers",
      where: {
        or: [{ phone: { equals: value } }, { phone: { equals: digits } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const account = res.docs[0];
    if (!account?.email) {
      return Response.json(
        { errors: [{ message: "No account found for that phone number." }] },
        { status: 401 },
      );
    }
    email = String(account.email).toLowerCase();
  }

  // Proxy to Payload's REST login and relay its Set-Cookie verbatim.
  const loginRes = await fetch(new URL("/api/customers/login", request.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await loginRes.text();
  const response = new Response(body, {
    status: loginRes.status,
    headers: { "Content-Type": "application/json" },
  });
  const setCookie = loginRes.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
