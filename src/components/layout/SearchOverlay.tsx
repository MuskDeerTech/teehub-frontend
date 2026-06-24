"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

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
  price?: number | null;
  bg?: string | null;
  cardImage?: { url?: string | null; alt?: string | null } | number | null;
};

type SearchResult = {
  id: number | string;
  title: string;
  slug: string;
  price: number | null;
  image: string | null;
  bg: string;
};

const MAX_RESULTS = 6;
const DEBOUNCE_MS = 300;

function mapDoc(doc: ProductDoc): SearchResult {
  const card =
    typeof doc.cardImage === "object" && doc.cardImage !== null
      ? doc.cardImage
      : undefined;
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    price: doc.price ?? doc.priceMin ?? null,
    image: card?.url ?? null,
    bg: doc.bg ?? "#f0f0f0",
  };
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
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

  const submit = () => {
    const term = query.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Click-away backdrop below the navbar */}
      <div
        className="fixed inset-0 top-[72px] z-[90] bg-black/30 max-[360px]:top-[70px]"
        onClick={onClose}
      />

      {/* Search panel */}
      <div className="absolute left-0 right-0 top-full z-[95] origin-top rounded-b-[20px] border-b border-[#e7e7e7] bg-white px-[clamp(16px,4vw,42px)] py-6 shadow-[0_24px_40px_rgba(0,0,0,0.12)]">
        <div className="w-full">
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
              <p className="py-6 text-center text-[14px] text-[#999]">
                Start typing to find products.
              </p>
            ) : loading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[10px] p-2">
                    <span className="h-12 w-12 shrink-0 rounded-[8px] bg-[#eee]" />
                    <span className="h-3 w-1/2 rounded bg-[#eee]" />
                  </div>
                ))}
              </div>
            ) : results.length === 0 && searched ? (
              <p className="py-6 text-center text-[14px] text-[#999]">
                No products match “{query.trim()}”.
              </p>
            ) : (
              <>
                <ul className="flex flex-col">
                  {results.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/product/${r.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-[10px] p-2 transition-colors hover:bg-black/5"
                      >
                        <span
                          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px]"
                          style={{ backgroundColor: r.bg }}
                        >
                          {r.image && (
                            <Image
                              src={r.image}
                              alt={r.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </span>
                        <span className="line-clamp-1 flex-1 text-[14px] text-[#222]">
                          {r.title}
                        </span>
                        {r.price != null && (
                          <span className="shrink-0 text-[14px] font-bold text-black">
                            ₹{r.price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>

                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={submit}
                    className="mt-3 w-full cursor-pointer rounded-full bg-[#ff5b1f] py-3 text-[14px] font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-[#e94e16]"
                  >
                    View all results for “{query.trim()}”
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
