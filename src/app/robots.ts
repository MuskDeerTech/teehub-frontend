 import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Cart/checkout are per-shopper pages with no search value — Google
      // recommends blocking them from crawling entirely.
      disallow: ["/admin", "/api/", "/cart", "/checkout"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
