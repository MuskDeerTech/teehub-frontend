"use client";

import { useBookmarks } from "@/components/providers/BookmarksProvider";

type BookmarkButtonProps = {
  id: string;
  className?: string;
};

export default function BookmarkButton({ id, className }: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useBookmarks();
  const saved = isBookmarked(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      aria-pressed={saved}
      className={className}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  if (filled) {
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

  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 18 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M3 1.5h12a1.5 1.5 0 0 1 1.5 1.5v17l-7.5-4.1L1.5 20V3A1.5 1.5 0 0 1 3 1.5z" />
    </svg>
  );
}
