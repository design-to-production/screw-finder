import { create as createOrama, insertMultiple, search } from "@orama/orama";
import type { CwScrewEntry } from "@/lib/cw-screws/entries";
import { getCwScrewEntrySearchText } from "@/lib/cw-screws/entries";
import { cwScrewEntryList, cwScrewsDocument } from "@/lib/cw-screws/screwDataset";
import type { CwScrewsDocument } from "@/lib/cw-screws/model";
import { create } from "zustand";

const SEARCH_DEBOUNCE_MS = 150;

/** Session-local Orama DB for catalog fuzzy search (built once per page load). */
let oramaDb: unknown = null;
let itemsById = new Map<string, CwScrewEntry>();
let indexBuildPromise: Promise<void> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let searchGeneration = 0;

async function buildOramaIndex(entries: readonly CwScrewEntry[]): Promise<void> {
  const db = await createOrama({
    schema: {
      id: "string",
      text: "string",
    },
  });
  const docs = entries.map(e => ({
    id: e.id,
    text: getCwScrewEntrySearchText(e),
  }));
  itemsById = new Map(entries.map(e => [e.id, e]));
  await insertMultiple(db as any, docs);
  oramaDb = db;
}

export type ScrewDataState = {
  document: CwScrewsDocument;
  /** Full catalog (e.g. fullcard resolves by index into this list). */
  entries: CwScrewEntry[];
  /** Subset after fuzzy search; equals `entries` when the query is empty. */
  filteredEntries: CwScrewEntry[];
  searchQuery: string;
  /** Orama fuzzy tolerance (`search` option). */
  searchTolerance: number;
  isSearchIndexing: boolean;
  searchError: string | null;
  setSearchQuery: (q: string) => void;
  clearSearchQuery: () => void;
  /** Build Orama index once; safe to call from multiple places (deduped). */
  ensureSearchIndex: () => Promise<void>;
};

export const useScrewDataStore = create<ScrewDataState>((set, get) => ({
  document: cwScrewsDocument,
  entries: cwScrewEntryList,
  filteredEntries: cwScrewEntryList,
  searchQuery: "",
  searchTolerance: 1,
  isSearchIndexing: false,
  searchError: null,

  ensureSearchIndex: async () => {
    if (oramaDb) return;
    if (indexBuildPromise) {
      await indexBuildPromise;
      return;
    }
    set({ isSearchIndexing: true, searchError: null });
    indexBuildPromise = (async () => {
      try {
        await buildOramaIndex(get().entries);
      } catch (e) {
        indexBuildPromise = null;
        oramaDb = null;
        itemsById = new Map();
        const msg = e instanceof Error ? e.message : String(e);
        set({ searchError: msg });
        throw e;
      } finally {
        set({ isSearchIndexing: false });
      }
    })();
    try {
      await indexBuildPromise;
    } catch {
      /* searchError set above */
    }
  },

  setSearchQuery: q => {
    set({ searchQuery: q });
    const gen = ++searchGeneration;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void (async () => {
        if (gen !== searchGeneration) return;
        const { entries, searchTolerance } = get();
        const trimmed = q.trim();
        if (!trimmed) {
          set({ filteredEntries: entries, searchError: null });
          return;
        }
        try {
          await get().ensureSearchIndex();
          if (gen !== searchGeneration) return;
          const db = oramaDb;
          if (!db) return;
          const result = await search(db as any, {
            term: trimmed,
            properties: ["text"],
            tolerance: searchTolerance,
            limit: entries.length,
          });
          if (gen !== searchGeneration) return;
          const rows = (result.hits ?? [])
            .map(h => itemsById.get(String(h.document.id)))
            .filter((x): x is CwScrewEntry => x !== undefined);
          set({ filteredEntries: rows, searchError: null });
        } catch {
          /* ensureSearchIndex may have set searchError */
        }
      })();
    }, SEARCH_DEBOUNCE_MS);
  },

  clearSearchQuery: () => {
    searchGeneration++;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    set({
      searchQuery: "",
      filteredEntries: get().entries,
      searchError: null,
    });
  },
}));
