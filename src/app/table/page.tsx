"use client";

import "@/lib/ag-grid";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/app/ag-grid-flat.css";

import { AppShell } from "@/components/AppShell";
import { FuzzySearchBar } from "@/components/FuzzySearchBar";
import { NavLinks } from "@/components/NavLinks";
import { useFuzzySearch } from "@/lib/search";
import {
  buildScrewEntries,
  getCwScrewEntrySearchText,
  type CwScrewEntry,
} from "@/lib/cw-screws/entries";
import { useMemo, useState } from "react";
import screwBase from "@/data/screw_base.json";
import type { CwScrewsDocument } from "@/lib/cw-screws/model";

const colDefs: ColDef<CwScrewEntry>[] = [
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
      title={<span className="text-lg font-semibold tracking-tight">Table</span>}
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

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="ag-grid-flat ag-theme-quartz-dark min-h-0 w-full flex-1"
          style={{ minHeight: 240, height: "100%" }}
        >
          <AgGridReact<CwScrewEntry>
            rowData={fuzzy.filteredItems}
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
