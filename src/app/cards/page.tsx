"use client";

import { AppShell } from "@/components/AppShell";
import { FuzzySearchBar } from "@/components/FuzzySearchBar";
import { NavLinks } from "@/components/NavLinks";
import { ScrewCardPreview } from "@/components/screw-preview/ScrewCardPreview";
import screwBase from "@/data/screw_base.json";
import {
  buildScrewEntries,
  getCwScrewEntrySearchText,
  type CwScrewEntry,
} from "@/lib/cw-screws/entries";
import { useFuzzySearch } from "@/lib/search";
import type { CwScrewsDocument } from "@/lib/cw-screws/model";
import { useMemo, useState } from "react";

function ScrewCard({ entry }: { entry: CwScrewEntry }) {
  const title = entry.name ?? entry.shortName ?? entry.itemId;
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[#fbf0df]/20 bg-[#1a1a1a]/90 shadow-sm">
      <ScrewCardPreview
        className="aspect-[4/3] w-full shrink-0 min-h-[200px]"
        lengthMm={entry.lengthMm}
        outerDiameterMm={entry.outerDiameterMm}
        innerDiameterMm={entry.innerDiameterMm}
        threadLengthMm={entry.threadLengthMm}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 border-t border-[#fbf0df]/10 p-4">
        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-[#fbf0df]">{title}</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-[#fbf0df]/75">
          {entry.shortName ? (
            <>
              <dt className="text-[#fbf0df]/45">Short</dt>
              <dd className="truncate">{entry.shortName}</dd>
            </>
          ) : null}
          <dt className="text-[#fbf0df]/45">Length</dt>
          <dd>{entry.lengthMm} mm</dd>
          {entry.threadLengthMm != null ? (
            <>
              <dt className="text-[#fbf0df]/45">Thread</dt>
              <dd>{entry.threadLengthMm} mm</dd>
            </>
          ) : null}
          {entry.outerDiameterMm != null ? (
            <>
              <dt className="text-[#fbf0df]/45">Ø outer</dt>
              <dd>{entry.outerDiameterMm} mm</dd>
            </>
          ) : null}
          {entry.material ? (
            <>
              <dt className="text-[#fbf0df]/45">Material</dt>
              <dd className="line-clamp-1">{entry.material}</dd>
            </>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

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
              <ScrewCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
