import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Shown as chips in the search panel's empty state until the CMS has its own
 * list, so a fresh install still looks like the design.
 */
export const DEFAULT_POPULAR_SEARCHES = [
  "RCB Jersey",
  "MI Jersey",
  "CSK Jersey",
  "India Jersey",
  "Football Jersey",
];

/** Admin-managed "Popular Searches" terms, falling back to the defaults. */
export async function getPopularSearches(): Promise<string[]> {
  const payload = await getPayload({ config });
  const search = (await payload.findGlobal({
    slug: "search",
    depth: 0,
  })) as { popularSearches?: { term?: string | null }[] | null };

  const terms = (search.popularSearches ?? [])
    .map((row) => row.term?.trim())
    .filter((term): term is string => Boolean(term));

  return terms.length > 0 ? terms : DEFAULT_POPULAR_SEARCHES;
}
