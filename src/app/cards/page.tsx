"use client";

import { AppShell } from "@/components/AppShell";
import { FuzzySearchBar } from "@/components/FuzzySearchBar";
import { NavLinks } from "@/components/NavLinks";
import { ScrewCatalogCard } from "@/components/screw-preview/ScrewCatalogCard";
import { useScrewDataStore } from "@/stores/screwDataStore";
import { useEffect } from "react";

export default function CardsPage() {
  const filteredEntries = useScrewDataStore(s => s.filteredEntries);
  const entries = useScrewDataStore(s => s.entries);
  const query = useScrewDataStore(s => s.searchQuery);
  const setQuery = useScrewDataStore(s => s.setSearchQuery);
  const clearQuery = useScrewDataStore(s => s.clearSearchQuery);
  const isIndexing = useScrewDataStore(s => s.isSearchIndexing);
  const searchError = useScrewDataStore(s => s.searchError);
  const ensureSearchIndex = useScrewDataStore(s => s.ensureSearchIndex);

  useEffect(() => {
    void ensureSearchIndex();
  }, [ensureSearchIndex]);

  return (
    <AppShell
      title={<span className="text-lg font-semibold tracking-tight">Cards</span>}
      center={
        <FuzzySearchBar
          variant="navbar"
          query={query}
          setQuery={setQuery}
          clearQuery={clearQuery}
          isIndexing={isIndexing}
          filteredCount={filteredEntries.length}
          totalCount={entries.length}
          placeholder="Search screws…"
          className="max-w-none"
        />
      }
      navRight={<NavLinks />}
    >
      {searchError ? (
        <div className="shrink-0 border-b border-red-400/80 bg-[#1a1a1a] px-2 py-2 font-mono text-sm text-red-200">
          {searchError}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid w-full gap-5 p-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,24rem),1fr))]">
            {filteredEntries.map(entry => (
              <ScrewCatalogCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
