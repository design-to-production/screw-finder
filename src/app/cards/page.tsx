"use client";

import { AppShell } from "@/components/AppShell";
import { FuzzySearchBar } from "@/components/FuzzySearchBar";
import { NavLinks } from "@/components/NavLinks";
import { ScrewCatalogCard } from "@/components/screw-preview/ScrewCatalogCard";
import screwBase from "@/data/screw_base.json";
import {
  buildScrewEntries,
  getCwScrewEntrySearchText,
  type CwScrewEntry,
} from "@/lib/cw-screws/entries";
import { useFuzzySearch } from "@/lib/search";
import type { CwScrewsDocument } from "@/lib/cw-screws/model";
import { useMemo, useState } from "react";

export default function CardsPage() {
  const [error, setError] = useState<string>("");

  const baseRows = useMemo(() => {
    return buildScrewEntries(screwBase as unknown as CwScrewsDocument);
  }, []);

  const fuzzy = useFuzzySearch<CwScrewEntry>({
    items: baseRows,
    getId: r => r.id,
    getSearchText: getCwScrewEntrySearchText,
    onIndexError: err => setError(err.message),
  });

  return (
    <AppShell
      title={<span className="text-lg font-semibold tracking-tight">Cards</span>}
      center={
        <FuzzySearchBar<CwScrewEntry>
          variant="navbar"
          query={fuzzy.query}
          setQuery={fuzzy.setQuery}
          clearQuery={fuzzy.clearQuery}
          isIndexing={fuzzy.isIndexing}
          filteredCount={fuzzy.filteredCount}
          totalCount={fuzzy.totalCount}
          placeholder="Search screws…"
          className="max-w-none"
        />
      }
      navRight={<NavLinks />}
    >
      {error ? (
        <div className="shrink-0 border-b border-red-400/80 bg-[#1a1a1a] px-2 py-2 font-mono text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid w-full gap-5 p-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,24rem),1fr))]">
            {fuzzy.filteredItems.map(entry => (
              <ScrewCatalogCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
