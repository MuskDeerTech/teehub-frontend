import { NextResponse } from "next/server";

/**
 * Stops anything between the browser and this app from caching API responses.
 *
 * Everything under /api/ is per-customer: who you are (`/api/customers/me`),
 * your orders, your cart. None of it may be stored by a shared cache, because
 * a shared cache can hand one customer's copy to the next person who asks.
 * `/api/customers/me` is the dangerous one — it is the same URL for every
 * signed-in customer, so a single cached copy is a data leak, not just stale
 * data.
 *
 * We saw the milder symptom first: a freshly placed order missing from order
 * history until Cloudflare was purged by hand.
 *
 * Three headers, because they are read by different layers:
 *
 *   Cache-Control                 browsers, and any proxy with no opinion
 *   CDN-Cache-Control             CDNs generally, ignored by browsers
 *   Cloudflare-CDN-Cache-Control  Cloudflare specifically; it wins there
 *
 * The last two matter more than they look. Our host rewrites `Cache-Control`
 * to `max-age=7200` on 200 responses — which is what caused this in the first
 * place — but it has no reason to touch the CDN-specific names, and Cloudflare
 * prefers those over `Cache-Control` anyway. So the fix survives the host
 * stamping over us.
 *
 * `cache: "no-store"` on the client (see AuthContext and OrderHistory) is the
 * other half of the same fix: that governs the browser's own cache, this
 * governs every cache in between.
 */
const NO_STORE = "no-store, private, max-age=0, must-revalidate";

export function middleware() {
  const response = NextResponse.next();
  response.headers.set("Cache-Control", NO_STORE);
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
  // Belt and braces: if some layer ignores the above, at least make it key the
  // entry on the session cookie rather than serving one customer's copy to all.
  response.headers.set("Vary", "Cookie");
  return response;
}

export const config = {
  // Only the API. Pages, images, fonts and JS bundles stay cacheable — those
  // carry no personal data and Cloudflare caching them is exactly what we want.
  matcher: "/api/:path*",
};
