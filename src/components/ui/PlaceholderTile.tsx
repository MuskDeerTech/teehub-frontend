/**
 * Empty catalog card — a coloured box with rounded corners and the bookmark
 * button, but no image, title or price. Used on category pages whose products
 * haven't been added yet, so the grid looks populated. The `bg` colour is
 * supplied jumbled per page (see getPlaceholderColors) so the same palette
 * reappears in a different order on each category.
 */
export default function PlaceholderTile({ bg }: { bg: string }) {
  return (
    <div
      className="relative aspect-5/6 w-full overflow-hidden rounded-[10px]"
      style={{ backgroundColor: bg }}
    >
      <button
        type="button"
        aria-label="Save for later"
        className="absolute right-3 top-3 z-10 text-white/95 drop-shadow transition-transform duration-200 hover:scale-110"
      >
        <BookmarkIcon />
      </button>
    </div>
  );
}

function BookmarkIcon() {
  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 18 22"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2 0h14a2 2 0 0 1 2 2v20l-9-5.2L0 22V2a2 2 0 0 1 2-2z" />
    </svg>
  );
}
