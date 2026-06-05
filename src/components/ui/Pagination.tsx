"use client";

/**
 * Pagination control (`1 2 3 … 10 ›`) matching the design. The page list is
 * built from the real `totalPages`, collapsing the middle with `…` when there
 * are many pages. Clicking a number (or `›`) calls `onPageChange`.
 */
export default function Pagination({
  current,
  totalPages,
  onPageChange,
}: {
  current: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = getPageList(current, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-7 py-14 text-[22px] font-bold text-[#111] max-[480px]:gap-5 max-[480px]:text-[18px]"
    >
      {pages.map((p, i) =>
        typeof p === "number" ? (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === current ? "page" : undefined}
            className={`cursor-pointer transition-colors duration-200 hover:text-[#ff5b1f] ${
              p === current ? "underline underline-offset-8" : ""
            }`}
          >
            {p}
          </button>
        ) : (
          <span key={`gap-${i}`} className="select-none text-[#999]">
            {p}
          </span>
        )
      )}
      {totalPages > 1 && (
        <button
          type="button"
          aria-label="Next page"
          disabled={current >= totalPages}
          onClick={() => onPageChange(current + 1)}
          className="cursor-pointer transition-colors duration-200 hover:text-[#ff5b1f] disabled:cursor-default disabled:text-[#ccc] disabled:hover:text-[#ccc]"
        >
          ›
        </button>
      )}
    </nav>
  );
}

/**
 * Builds the displayed page list: every page when there are few, otherwise the
 * first/last page plus the current page's neighbours, with `…` filling the gaps.
 */
function getPageList(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [1];
  if (current > 3) pages.push("…");

  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }

  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
