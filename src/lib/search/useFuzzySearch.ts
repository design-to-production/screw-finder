"use client";

import { create, insertMultiple, search } from "@orama/orama";
import { useCallback, useEffect, useRef, useState } from "react";

export type UseFuzzySearchOptions<T> = {
  items: readonly T[];
  getId: (item: T) => string;
  getSearchText: (item: T) => string;
  /** Debounce for search (ms). Default 150. */
  debounceMs?: number;
  /** Orama fuzzy tolerance. Default 1. */
  tolerance?: number;
  onIndexError?: (error: Error) => void;
};

export type UseFuzzySearchResult<T> = {
  query: string;
  setQuery: (value: string) => void;
  clearQuery: () => void;
  filteredItems: T[];
  isIndexing: boolean;
  totalCount: number;
  filteredCount: number;
};

/**
 * Client-side fuzzy full-text search over `items` using Orama. No network calls.
 * Rebuilds the index when `items` or `getId` / `getSearchText` identity changes.
 */
export function useFuzzySearch<T>({
  items,
  getId,
  getSearchText,
  debounceMs = 150,
  tolerance = 1,
  onIndexError,
}: UseFuzzySearchOptions<T>): UseFuzzySearchResult<T> {
  const [query, setQuery] = useState("");
  const [isIndexing, setIsIndexing] = useState(false);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);

  const dbRef = useRef<unknown>(null);
  const itemsByIdRef = useRef<Map<string, T>>(new Map());

  const getIdRef = useRef(getId);
  const getSearchTextRef = useRef(getSearchText);
  getIdRef.current = getId;
  getSearchTextRef.current = getSearchText;

  // Build / rebuild index when dataset changes.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsIndexing(true);
      dbRef.current = null;
      try {
        const db = await create({
          schema: {
            id: "string",
            text: "string",
          },
        });

        const idFn = getIdRef.current;
        const textFn = getSearchTextRef.current;
        const docs = items.map(item => ({
          id: idFn(item),
          text: textFn(item),
        }));

        const map = new Map(items.map(item => [idFn(item), item]));
        itemsByIdRef.current = map;
        await insertMultiple(db as any, docs);
        if (!cancelled) dbRef.current = db;
      } catch (e) {
        if (!cancelled) {
          onIndexError?.(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (!cancelled) setIsIndexing(false);
      }
    }

    const handle = setTimeout(run, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [items, onIndexError]);

  const clearQuery = useCallback(() => setQuery(""), []);

  // Debounced search + pass-through when query empty.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      const q = query.trim();
      if (!q) {
        setFilteredItems([...items]);
        return;
      }
      if (isIndexing) return;
      const db = dbRef.current;
      if (!db) return;
      const result = await search(db as any, {
        term: q,
        properties: ["text"],
        tolerance,
        // Orama defaults to limit: 10; we need every matching row for this UI.
        limit: items.length,
      });
      const rows = (result.hits ?? [])
        .map(h => itemsByIdRef.current.get(String(h.document.id)))
        .filter((x): x is T => x !== undefined);
      if (!cancelled) setFilteredItems(rows);
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, items, isIndexing, debounceMs, tolerance]);

  // After indexing finishes, re-run fuzzy match if query non-empty (no debounce).
  useEffect(() => {
    if (isIndexing || !query.trim()) return;
    const db = dbRef.current;
    if (!db) return;
    let cancelled = false;
    void (async () => {
      const result = await search(db as any, {
        term: query.trim(),
        properties: ["text"],
        tolerance,
        limit: items.length,
      });
      const rows = (result.hits ?? [])
        .map(h => itemsByIdRef.current.get(String(h.document.id)))
        .filter((x): x is T => x !== undefined);
      if (!cancelled) setFilteredItems(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [isIndexing, query, tolerance, items.length]);

  return {
    query,
    setQuery,
    clearQuery,
    filteredItems,
    isIndexing,
    totalCount: items.length,
    filteredCount: filteredItems.length,
  };
}
