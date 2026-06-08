/** Stable bookmark keys shared across cards and any future saved-items page. */
export function jerseyBookmarkId(title: string) {
  return `jersey:${title}`;
}

export function productBookmarkId(slug: string) {
  return `product:${slug}`;
}
