import screwBase from "@/data/screw_base.json";
import { buildScrewEntries } from "./entries";
import type { CwScrewsDocument } from "./model";

/** Parsed connector document — loaded once per JS runtime (shared by store + server routes). */
export const cwScrewsDocument = screwBase as unknown as CwScrewsDocument;

/** Flattened screw rows in deterministic catalog order. */
export const cwScrewEntryList = buildScrewEntries(cwScrewsDocument);
