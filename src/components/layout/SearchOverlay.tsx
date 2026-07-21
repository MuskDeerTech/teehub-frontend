"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconClock, IconSearch, IconX } from "@tabler/icons-react";
import { useSearch } from "@/components/providers/SearchProvider";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

// The fields we read off each Payload product doc (depth=1) for a result row.
type ProductDoc = {
  id: number | string;
  title: string;
  slug: string;
  priceMin?: number | null;
  priceMax?: number | null;
  price?: number | null;
  bg?: string | null;
  cardImage?: { url?: string | null; alt?: string | null } | number | null;
};

type SearchResult = {
  id: number | string;
  title: string;
  slug: string;
  priceLabel: string | null;
  image: string | null;
  bg: string;
};

const MAX_RESULTS = 5;
const DEBOUNCE_MS = 300;

// Result cards: 5 across on desktop, stepping down so cards never get cramped.
const RESULT_GRID_CLASS =
  "grid grid-cols-5 gap-x-5 gap-y-6 max-[1280px]:grid-cols-4 max-[1024px]:grid-cols-3 max-[680px]:grid-cols-2";

const rupees = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** "₹899.00 – ₹1,099.00" when the product spans a range, one price otherwise. */
function priceLabelFor(doc: ProductDoc): string | null {
  const min = doc.price ?? doc.priceMin ?? null;
  if (min == null) return null;
  const max = doc.priceMax ?? null;
  return max != null && max > min ? `${rupees(min)} – ${rupees(max)}` : rupees(min);
}

function mapDoc(doc: ProductDoc): SearchResult {
  const card =
    typeof doc.cardImage === "object" && doc.cardImage !== null
      ? doc.cardImage
      : undefined;
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    priceLabel: priceLabelFor(doc),
    image: card?.url ?? null,
    bg: doc.bg ?? "#f0f0f0",
  };
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const {
    popularSearches,
    recentSearches,
    rememberSearch,
    forgetSearch,
    clearRecentSearches,
  } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  // Tracks whether the current query has produced a response yet, so we only
  // show "no results" after an actual search (not while idle/typing).
  const [searched, setSearched] = useState(false);

  // Focus the field as soon as the overlay opens; reset state when it closes.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setResults([]);
      setSearched(false);
      setLoading(false);
    }
  }, [open]);

  // Close on Escape from anywhere while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced live search against Payload's public products REST endpoint.
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const words = term.split(/\s+/).filter(Boolean);
      const params = new URLSearchParams({
        depth: "1",
        limit: String(MAX_RESULTS),
        sort: "sortOrder",
        "where[and][0][isPublished][equals]": "true",
      });
      words.forEach((word, i) => {
        params.set(`where[and][${i + 1}][title][like]`, word);
      });

      fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
        .then((data: { docs?: ProductDoc[] }) => {
          setResults((data.docs ?? []).map(mapDoc));
          setSearched(true);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setResults([]);
          setSearched(true);
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const runSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    rememberSearch(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  const submit = () => runSearch(query);

  if (!open) return null;

  return (
    <>
      {/* Click-away backdrop below the navbar */}
      <div
        className="fixed inset-0 top-[72px] z-[90] bg-black/30 max-[1024px]:top-[76px]"
        onClick={onClose}
      />

      {/* Search panel */}
      <div className="absolute left-0 right-0 top-full z-[95] origin-top flex max-h-[calc(100vh-140px)] gap-8 overflow-y-auto rounded-b-[20px] border-b border-[#e7e7e7] bg-white px-[clamp(16px,4vw,42px)] py-6 shadow-[0_24px_40px_rgba(0,0,0,0.12)]">
        <div className="min-w-0 flex-1">
          {/* INPUT */}
          <div className="flex items-center gap-3 border-b-2 border-black/80 pb-3">
            <IconSearch size={24} stroke={1.5} className="shrink-0 text-black" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Search for jerseys, hoodies, teams…"
              className="h-9 w-full bg-transparent text-[16px] text-black outline-none placeholder:text-[#999]"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#666] transition-colors hover:bg-black/5 hover:text-black"
            >
              <IconX size={20} stroke={1.5} />
            </button>
          </div>

          {/* RESULTS */}
          <div className="mt-4">
            {!query.trim() ? (
              <div className="flex flex-col gap-6 pb-2 pt-2">
                {popularSearches.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-[15px] font-bold text-black">
                      Popular Searches
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => runSearch(term)}
                          className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-[#ff5b1f] px-3 py-2 text-[13px] text-[#333] transition-colors hover:bg-[#ff5b1f]/5"
                        >
                          <IconSearch size={15} stroke={1.8} className="text-[#ff5b1f]" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {recentSearches.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-[15px] font-bold text-black">
                      Recently Searched
                    </h3>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {recentSearches.map((term) => (
                        <span
                          key={term}
                          className="flex items-center gap-2 rounded-[8px] border border-[#ff5b1f] px-3 py-2 text-[13px] text-[#333]"
                        >
                          <IconClock size={15} stroke={1.8} className="text-[#ff5b1f]" />
                          <button
                            type="button"
                            onClick={() => runSearch(term)}
                            className="cursor-pointer"
                          >
                            {term}
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${term} from recent searches`}
                            onClick={() => forgetSearch(term)}
                            className="cursor-pointer text-[#999] transition-colors hover:text-black"
                          >
                            <IconX size={14} stroke={2} />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="cursor-pointer text-[13px] text-[#ff5b1f] underline transition-colors hover:text-[#e94e16]"
                      >
                        Clear all
                      </button>
                    </div>
                  </section>
                )}
              </div>
            ) : loading ? (
              <div className={RESULT_GRID_CLASS}>
                {Array.from({ length: MAX_RESULTS }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <span className="aspect-square w-full rounded-[12px] bg-[#eee]" />
                    <span className="h-3 w-4/5 rounded bg-[#eee]" />
                    <span className="h-3 w-3/5 rounded bg-[#eee]" />
                  </div>
                ))}
              </div>
            ) : results.length === 0 && searched ? (
              <p className="py-6 text-center text-[14px] text-[#999]">
                No products match “{query.trim()}”.
              </p>
            ) : (
              <>
                <ul className={RESULT_GRID_CLASS}>
                  {results.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/product/${r.slug}`}
                        onClick={onClose}
                        className="group flex flex-col gap-2.5"
                      >
                        <span
                          className="relative block aspect-square w-full overflow-hidden rounded-[12px]"
                          style={{ backgroundColor: r.bg }}
                        >
                          {r.image && (
                            <Image
                              src={r.image}
                              alt={r.title}
                              fill
                              sizes="(max-width: 768px) 50vw, 220px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                        </span>
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0">
                            <span className="line-clamp-2 block text-[12px] leading-snug text-[#222]">
                              {r.title}
                            </span>
                            {r.priceLabel && (
                              <span className="mt-1 block text-[12px] text-[#222]">
                                {r.priceLabel}
                              </span>
                            )}
                          </span>
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-[18px] leading-none text-[#666] transition-colors group-hover:text-[#ff5b1f]"
                          >
                            +
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {results.length > 0 && (
                  <div className="mt-7 flex justify-center">
                    <button
                      type="button"
                      onClick={submit}
                      className="cursor-pointer rounded-full bg-[#ff5b1f] px-9 py-3.5 text-[14px] font-bold uppercase tracking-[0.5px] text-white transition-colors hover:bg-[#e94e16]"
                    >
                      Discover More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Promo artwork — only alongside the idle suggestions, and desktop only
            (below 1024px the panel is too narrow for two columns). */}
        {!query.trim() && (
          <div className="relative w-[clamp(240px,24vw,324px)] shrink-0 self-stretch overflow-hidden rounded-[16px] max-[1024px]:hidden">
            {/* `fill` keeps the artwork out of the height calculation, so the
                panel is sized by the suggestions column; `contain` then scales
                the whole image down to fit that height instead of cropping it. */}
            <Image
              src="/images/search.webp"
              alt=""
              fill
              sizes="324px"
              className="object-contain object-right"
            />
          </div>
        )}
      </div>
    </>
  );
}
