/**
 * Shared SEO/metadata helpers for storefront routes. Every public page builds
 * its Next.js `Metadata` through `buildMetadata`, so the meta title, description,
 * canonical, and social tags come out consistently. CMS-editable overrides (from
 * the Payload SEO plugin) win; when a field is blank we fall back to sensible
 * page-derived defaults here.
 */
import type { Metadata } from "next";
import type { Seo } from "@/lib/products";

/**
 * Public origin used for canonical + Open Graph URLs. Defaults to the live
 * domain — SEO only matters for the real site, so localhost/test hosts reuse it.
 * Override with NEXT_PUBLIC_SITE_URL only if the domain ever changes.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://teehubshop.com"
).replace(/\/$/, "");

/** Absolute URL for a storefront path (e.g. "/product/foo" → "https://…/product/foo"). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

interface BuildMetadataArgs {
  /** Final meta title (caller applies any CMS override + brand suffix). */
  title: string;
  description?: string;
  /** The page's own storefront path, used for the self-canonical + og:url. */
  path: string;
  /** CMS canonical override; when set it wins over the self-canonical. */
  seo?: Seo;
}

/** Builds the full Metadata set (title, description, canonical, OG, Twitter). */
export function buildMetadata({
  title,
  description,
  path,
  seo,
}: BuildMetadataArgs): Metadata {
  const metaTitle = seo?.title || title;
  const metaDescription = seo?.description || description;
  const canonical = seo?.canonicalURL || absoluteUrl(path);

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonical,
      siteName: "TeeHub",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
    },
  };
}
