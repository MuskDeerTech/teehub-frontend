"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "teehub-bookmarks";

type BookmarksContextValue = {
  isBookmarked: (id: string) => boolean;
  toggle: (id: string) => void;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

function loadBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveBookmarks(bookmarks: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
}

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  const toggle = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveBookmarks(next);
      return next;
    });
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
