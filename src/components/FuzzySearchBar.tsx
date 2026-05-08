"use client";

import type { UseFuzzySearchResult } from "@/lib/search/useFuzzySearch";

export type FuzzySearchBarProps<T> = Pick<
  UseFuzzySearchResult<T>,
  "query" | "setQuery" | "clearQuery" | "isIndexing" | "filteredCount" | "totalCount"
> & {
  placeholder?: string;
  clearLabel?: string;
  className?: string;
};

/**
 * Presentational UI for `useFuzzySearch`. Pass the hook result spread or picked fields.
 */
export function FuzzySearchBar<T>({
  query,
  setQuery,
  clearQuery,
  isIndexing,
  filteredCount,
  totalCount,
  placeholder = "Search…",
  clearLabel = "Clear search",
  className = "",
}: FuzzySearchBarProps<T>) {
  const q = query.trim();
  return (
    <div className={`bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-4 mb-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full md:flex-1 bg-transparent border-0 text-[#fbf0df] font-mono text-sm py-2 px-2 outline-none focus:text-white placeholder-[#fbf0df]/40"
          aria-label="Fuzzy search"
        />
        <button
          type="button"
          className="bg-transparent text-[#fbf0df] border-2 border-[#fbf0df] px-4 py-2 rounded-lg font-bold transition-colors duration-100 hover:border-[#f3d5a3] hover:text-white cursor-pointer"
          onClick={clearQuery}
        >
          {clearLabel}
        </button>
        <div className="font-mono text-sm opacity-80">
          {isIndexing ? (
            <span className="opacity-100">Indexing…</span>
          ) : (
            <>
              Rows: <span className="opacity-100 font-bold">{filteredCount}</span>
              {q ? (
                <>
                  {" "}
                  / <span className="opacity-100">{totalCount}</span>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
