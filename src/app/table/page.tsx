'use client';

import '@/lib/ag-grid';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { parseCwScrewsVbax } from '@/lib/cw-screws/parse';
import { buildScrewEntries, type CwScrewEntry } from '@/lib/cw-screws/entries';
import { useMemo, useState } from 'react';
import screwBase from '@/data/screw_base.json';
import type { CwScrewsDocument } from '@/lib/cw-screws/model';

const colDefs: ColDef<CwScrewEntry>[] = [
  { field: 'name', headerName: 'Name', flex: 2, minWidth: 240, filter: true },
  { field: 'shortName', headerName: 'Short', flex: 1, minWidth: 160, filter: true },
  { field: 'material', headerName: 'Material', flex: 1, minWidth: 180, filter: true },
  { field: 'norm', headerName: 'Norm', flex: 1, minWidth: 160, filter: true },

  { field: 'manufacturer', headerName: 'Manufacturer', flex: 1, minWidth: 160, filter: true },
  { field: 'drive', headerName: 'Drive', width: 120, filter: true },

  { field: 'outerDiameterMm', headerName: 'Ø outer', width: 120, filter: 'agNumberColumnFilter' },
  { field: 'innerDiameterMm', headerName: 'Ø inner', width: 120, filter: 'agNumberColumnFilter' },
  { field: 'drillingDiameter2Mm', headerName: 'Ø drill', width: 120, filter: 'agNumberColumnFilter' },

  { field: 'lengthMm', headerName: 'Length', width: 120, filter: 'agNumberColumnFilter', sort: 'asc' },
  { field: 'threadLengthMm', headerName: 'Thread', width: 120, filter: 'agNumberColumnFilter' },
  { field: 'lengthWeightKg', headerName: 'Weight (kg)', width: 140, filter: 'agNumberColumnFilter' },
  { field: 'lengthOrderNumber', headerName: 'Order #', width: 160, filter: true },

  { field: 'itemId', headerName: 'Item ID', width: 260, filter: true }
];

export default function TablePage() {
  const [fileName, setFileName] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [error, setError] = useState<string>('');

  const rows = useMemo(() => {
    if (!rawText) {
      return buildScrewEntries(screwBase as unknown as CwScrewsDocument);
    }
    try {
      setError('');
      const doc = parseCwScrewsVbax(rawText);
      return buildScrewEntries(doc);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return [] as CwScrewEntry[];
    }
  }, [rawText]);

  return (
    <div className="max-w-7xl mx-auto p-8 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Table</h1>
      </div>

      {error ? (
        <div className="bg-[#1a1a1a] border-2 border-red-400 rounded-xl p-4 text-red-200 font-mono text-sm whitespace-pre-wrap mb-4">
          {error}
        </div>
      ) : null}

      <div className="ag-theme-quartz-dark" style={{ height: '70vh', width: '100%' }}>
        <AgGridReact<CwScrewEntry>
          rowData={rows}
          columnDefs={colDefs}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
            floatingFilter: true
          }}
          animateRows
          // AG Grid virtualizes rows by default; keep pagination off for virtual scroll.
          pagination={false}
          rowBuffer={40}
        />
      </div>
    </div>
  );
}
