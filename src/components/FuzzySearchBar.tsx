"use client";

export type FuzzySearchBarProps = {
  query: string;
  setQuery: (value: string) => void;
  clearQuery: () => void;
  isIndexing: boolean;
  filteredCount: number;
  totalCount: number;
} & {
  placeholder?: string;
  clearLabel?: string;
  className?: string;
  /** `navbar`: compact row for top bar; `default`: padded card below title */
  variant?: "default" | "navbar";
};

/** Navbar / card search UI wired to catalog search state (see {@link useScrewDataStore}). */
export function FuzzySearchBar({
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
}: FuzzySearchBarProps) {
  const q = query.trim();
  const shell =
    variant === "navbar"
      ? `rounded-lg border border-d2p-border bg-d2p-cream/90 px-2 py-1 w-full max-w-xl transition-colors duration-200 hover:border-d2p-red/25 hover:bg-d2p-surface`
      : `rounded-xl border-2 border-d2p-border bg-d2p-surface p-4 mb-4 shadow-sm transition-colors duration-200 hover:border-d2p-red/30`;

  return (
    <div className={`${shell} ${className}`}>
      <div className={`flex flex-wrap items-center gap-2 ${variant === "navbar" ? "md:flex-nowrap" : ""}`}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`min-w-0 bg-transparent font-mono text-sm text-d2p-ink outline-none transition-colors placeholder:text-d2p-muted/70 focus:text-d2p-ink ${
            variant === "navbar"
              ? "flex-1 w-full border-0 px-2 py-1 shadow-none ring-0 focus:ring-0"
              : "w-full rounded-md border-0 py-2 px-2 md:flex-1"
          }`}
          aria-label="Fuzzy search"
        />
        <button
          type="button"
          className={
            variant === "navbar"
              ? "shrink-0 cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 font-semibold text-sm text-d2p-red ring-0 transition-colors hover:bg-d2p-red/10 hover:text-d2p-red-dark active:bg-d2p-red/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d2p-red/30"
              : "shrink-0 cursor-pointer rounded-lg border-2 border-d2p-red bg-d2p-red px-4 py-2 font-bold text-white transition-colors hover:bg-d2p-red-dark active:translate-y-px"
          }
          onClick={clearQuery}
        >
          {clearLabel}
        </button>
        <div
          className={`font-mono shrink-0 text-xs text-d2p-muted transition-colors ${
            variant === "navbar" ? "" : "text-sm"
          }`}
        >
          {isIndexing ? (
            <span className="text-d2p-red">Indexing…</span>
          ) : (
            <>
              Rows: <span className="font-bold text-d2p-ink">{filteredCount}</span>
              {q ? (
                <>
                  {" "}
                  / <span>{totalCount}</span>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
