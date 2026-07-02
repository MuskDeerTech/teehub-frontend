/**
 * Server-side data layer for static content pages (policies, terms, etc.),
 * mirroring catalog.ts: read from Payload's Local API and hand the route a
 * plain shape. The rich-text `content` is passed straight through to the
 * RichText renderer, so the route never touches Payload's lexical JSON.
 * Server components only.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { Page as PageDoc } from "../../payload-types";
import type { Seo } from "@/lib/products";

const PAGE_LIMIT = 200;

export type Page = {
  slug: string;
  title: string;
  content: PageDoc["content"];
  seo?: Seo;
};

function toPage(doc: PageDoc): Page {
  const meta = doc.meta;
  const seo: Seo | undefined = meta
    ? {
        title: meta.title ?? undefined,
        description: meta.description ?? undefined,
        canonicalURL: meta.canonicalURL ?? undefined,
      }
    : undefined;
  return {
    slug: doc.slug,
    title: doc.title,
    content: doc.content,
    seo: seo && (seo.title || seo.description || seo.canonicalURL) ? seo : undefined,
  };
}

/** A single published page by slug — the policy route's data source. */
export async function getPage(slug: string): Promise<Page | undefined> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "pages",
    where: {
      and: [{ isPublished: { equals: true } }, { slug: { equals: slug } }],
    },
    limit: 1,
  });
  return res.docs[0] ? toPage(res.docs[0]) : undefined;
}

/** Every published page — used to enumerate /policies/<slug> at build time. */
export async function getAllPages(): Promise<Page[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "pages",
    where: { isPublished: { equals: true } },
    limit: PAGE_LIMIT,
  });
  return res.docs.map(toPage);
}
