/**
 * Visual pagination control (`1 2 3 … 10 ›`) matching the design. Static for
 * now — wiring real page state/links comes when the product set is paginated.
 */
export default function Pagination({
  current = 1,
  pages = [1, 2, 3, "…", 10] as (number | string)[],
}: {
  current?: number;
  pages?: (number | string)[];
}) {
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
      <button
        type="button"
        aria-label="Next page"
        className="cursor-pointer transition-colors duration-200 hover:text-[#ff5b1f]"
      >
        ›
      </button>
    </nav>
  );
}
