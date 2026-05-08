"use client";

import type { UseFuzzySearchResult } from "@/lib/search/useFuzzySearch";

export type FuzzySearchBarProps<T> = Pick<
  UseFuzzySearchResult<T>,
  "query" | "setQuery" | "clearQuery" | "isIndexing" | "filteredCount" | "totalCount"
> & {
  placeholder?: string;
  clearLabel?: string;
  className?: string;
  /** `navbar`: compact row for top bar; `default`: padded card below title */
  variant?: "default" | "navbar";
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
  variant = "default",
}: FuzzySearchBarProps<T>) {
  const q = query.trim();
  const shell =
    variant === "navbar"
      ? `bg-[#1a1a1a] px-1 py-0 w-full max-w-xl border-0 transition-colors duration-200 hover:bg-[#fbf0df]/[0.06]`
      : `bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-4 mb-4 transition-colors duration-200 hover:border-[#f3d5a3]/70`;

  return (
    <div className={`${shell} ${className}`}>
      <div className={`flex flex-wrap items-center gap-2 ${variant === "navbar" ? "md:flex-nowrap" : ""}`}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`min-w-0 bg-transparent text-[#fbf0df] font-mono text-sm outline-none transition-colors duration-150 focus:text-white placeholder-[#fbf0df]/40 placeholder:transition-opacity hover:placeholder:text-[#fbf0df]/55 ${
            variant === "navbar"
              ? "flex-1 w-full border-0 px-1 py-0.5 shadow-none ring-0 focus:border-0 focus:bg-[#fbf0df]/[0.07] focus:ring-0 hover:bg-[#fbf0df]/[0.05]"
              : "w-full border-0 py-1.5 px-2 hover:bg-[#fbf0df]/[0.04] md:flex-1"
          }`}
          aria-label="Fuzzy search"
        />
        <button
          type="button"
          className={
            variant === "navbar"
              ? "shrink-0 cursor-pointer border-0 bg-transparent px-2 py-0.5 font-semibold text-sm text-[#fbf0df] ring-0 transition-colors duration-150 hover:bg-[#fbf0df]/15 hover:text-white active:bg-[#fbf0df]/20 focus-visible:outline-none focus-visible:ring-0"
              : "shrink-0 cursor-pointer rounded-lg border-2 border-[#fbf0df] bg-transparent px-4 py-2 font-bold text-[#fbf0df] transition-colors duration-150 hover:border-[#f3d5a3] hover:bg-[#fbf0df]/10 hover:text-white active:translate-y-px"
          }
          onClick={clearQuery}
        >
          {clearLabel}
        </button>
        <div
          className={`font-mono shrink-0 transition-colors duration-150 ${
            variant === "navbar"
              ? "text-xs text-[#fbf0df]/70 hover:text-[#fbf0df]"
              : "text-sm opacity-80"
          }`}
        >
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
