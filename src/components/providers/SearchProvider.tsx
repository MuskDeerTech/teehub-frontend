"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const RECENT_KEY = "teehub-recent-searches";
const EMPTY_RECENT = "[]";
const MAX_RECENT = 5;
const listeners = new Set<() => void>();

type SearchContextValue = {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  /** Admin-managed suggestion chips. */
  popularSearches: string[];
  /** This visitor's own history, newest first. */
  recentSearches: string[];
  rememberSearch: (term: string) => void;
  forgetSearch: (term: string) => void;
  clearRecentSearches: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

function readRecentJson() {
  if (typeof window === "undefined") return EMPTY_RECENT;
  return localStorage.getItem(RECENT_KEY) ?? EMPTY_RECENT;
}

function parseRecent(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]).filter((t) => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function saveRecent(terms: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(terms));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * Owns the search-overlay open state plus the shopper's recent searches, so
 * any page section can open the same overlay — the navbar renders it, the
 * hero's search field triggers it — instead of each building its own UI.
 */
export function SearchProvider({
  children,
  popularSearches = [],
}: {
  children: ReactNode;
  popularSearches?: string[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Read through the store so every consumer re-renders on a write, and SSR
  // renders the empty list rather than reaching for localStorage.
  const recentJson = useSyncExternalStore(subscribe, readRecentJson, () => EMPTY_RECENT);
  const recentSearches = useMemo(() => parseRecent(recentJson), [recentJson]);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const rememberSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const current = parseRecent(readRecentJson());
    // Case-insensitive dedupe, newest first, capped.
    const deduped = current.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    saveRecent([trimmed, ...deduped].slice(0, MAX_RECENT));
  }, []);

  const forgetSearch = useCallback((term: string) => {
    const current = parseRecent(readRecentJson());
    saveRecent(current.filter((t) => t !== term));
  }, []);

  const clearRecentSearches = useCallback(() => saveRecent([]), []);

  const value = useMemo(
    () => ({
      searchOpen,
      openSearch,
      closeSearch,
      popularSearches,
      recentSearches,
      rememberSearch,
      forgetSearch,
      clearRecentSearches,
    }),
    [
      searchOpen,
      openSearch,
      closeSearch,
      popularSearches,
      recentSearches,
      rememberSearch,
      forgetSearch,
      clearRecentSearches,
    ],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}
