import newCatalog from "@/data/new_data_model.json";
import type { CwScrewsDocument } from "./model";
import type { D2pCatalogFile } from "./d2pCatalogSchema";
import { buildCatalogFromD2pFile } from "./d2pCatalog";
import type { CwScrewEntry } from "./entries";

const built = buildCatalogFromD2pFile(newCatalog as D2pCatalogFile);

/** Parsed catalog document — loaded once per JS runtime (shared by store + server routes). */
export const cwScrewsDocument: CwScrewsDocument = built.document;

/** Flattened screw rows in deterministic catalog order. */
export const cwScrewEntryList: CwScrewEntry[] = built.entries;
