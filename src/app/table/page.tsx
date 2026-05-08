"use client";

import "@/lib/ag-grid";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, IHeaderParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/app/ag-grid-flat.css";

import { AppShell } from "@/components/AppShell";
import { FuzzySearchBar } from "@/components/FuzzySearchBar";
import { NavLinks } from "@/components/NavLinks";
import type { CwScrewEntry } from "@/lib/cw-screws/entries";
import { useScrewDataStore } from "@/stores/screwDataStore";
import Link from "next/link";
import { useEffect } from "react";

/** “Open full detail” — window with northeast arrow (matches external-link affordance). */
function FullCardGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function FullCardHeader(_props: IHeaderParams) {
  return (
    <div
      className="flex h-full w-full items-center justify-center text-[#fbf0df]/70"
      title="Full card detail"
    >
      <FullCardGlyph className="h-[17px] w-[17px]" />
    </div>
  );
}

function FullCardLinkCell(props: ICellRendererParams<CwScrewEntry>) {
  const idx = props.data?.listIndex;
  if (idx === undefined) return null;
  return (
    <Link
      href={`/fullcard/${idx}/`}
      className="inline-flex items-center justify-center rounded-md border border-[#fbf0df]/28 p-1.5 text-[#fbf0df]/90 transition-colors hover:border-[#f3d5a3]/45 hover:bg-[#fbf0df]/10"
      aria-label="Open full card"
      title="Full card"
    >
      <FullCardGlyph className="h-[17px] w-[17px]" />
    </Link>
  );
}

const colDefs: ColDef<CwScrewEntry>[] = [
  {
    colId: "fullCard",
    headerName: "",
    width: 52,
    minWidth: 48,
    maxWidth: 56,
    pinned: "left",
    lockPosition: true,
    sortable: false,
    filter: false,
    floatingFilter: false,
    suppressHeaderFilterButton: true,
    headerComponent: FullCardHeader,
    cellRenderer: FullCardLinkCell,
  },

  { field: "name", headerName: "Name", flex: 2, minWidth: 240, filter: true },
  { field: "shortName", headerName: "Short", flex: 1, minWidth: 160, filter: true },
  { field: "material", headerName: "Material", flex: 1, minWidth: 180, filter: true },
  { field: "norm", headerName: "Norm", flex: 1, minWidth: 160, filter: true },

  { field: "manufacturer", headerName: "Manufacturer", flex: 1, minWidth: 160, filter: true },
  { field: "drive", headerName: "Drive", width: 120, filter: true },

  { field: "outerDiameterMm", headerName: "Ø outer", width: 120, filter: "agNumberColumnFilter" },
  { field: "innerDiameterMm", headerName: "Ø inner", width: 120, filter: "agNumberColumnFilter" },
  { field: "drillingDiameter2Mm", headerName: "Ø drill", width: 120, filter: "agNumberColumnFilter" },

  { field: "lengthMm", headerName: "Length", width: 120, filter: "agNumberColumnFilter", sort: "asc" },
  { field: "threadLengthMm", headerName: "Thread", width: 120, filter: "agNumberColumnFilter" },
  { field: "lengthWeightKg", headerName: "Weight (kg)", width: 140, filter: "agNumberColumnFilter" },
  { field: "lengthOrderNumber", headerName: "Order #", width: 160, filter: true },
];

export default function TablePage() {
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
      title={<span className="text-lg font-semibold tracking-tight">Table</span>}
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

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="ag-grid-flat ag-theme-quartz-dark min-h-0 w-full flex-1"
          style={{ minHeight: 240, height: "100%" }}
        >
          <AgGridReact<CwScrewEntry>
            rowData={filteredEntries}
            columnDefs={colDefs}
            theme="legacy"
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true,
              floatingFilter: true,
            }}
            animateRows
            pagination={false}
            rowBuffer={40}
          />
        </div>
      </div>
    </AppShell>
  );
}
