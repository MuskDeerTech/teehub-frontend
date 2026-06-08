"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "teehub-bookmarks";
const EMPTY_BOOKMARKS = "[]";
const listeners = new Set<() => void>();

type BookmarksContextValue = {
  isBookmarked: (id: string) => boolean;
  toggle: (id: string) => void;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

function readBookmarkJson() {
  if (typeof window === "undefined") return EMPTY_BOOKMARKS;
  return localStorage.getItem(STORAGE_KEY) ?? EMPTY_BOOKMARKS;
}

function parseBookmarks(raw: string): Set<string> {
  try {
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveBookmarks(bookmarks: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const bookmarkJson = useSyncExternalStore(
    subscribe,
    readBookmarkJson,
    () => EMPTY_BOOKMARKS,
  );
  const bookmarks = useMemo(() => parseBookmarks(bookmarkJson), [bookmarkJson]);

  const toggle = useCallback((id: string) => {
    const next = parseBookmarks(readBookmarkJson());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    saveBookmarks(next);
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.has(id),
    [bookmarks],
  );

  const value = useMemo(
    () => ({ isBookmarked, toggle }),
    [isBookmarked, toggle],
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) {
    throw new Error("useBookmarks must be used within BookmarksProvider");
  }
  return ctx;
}
