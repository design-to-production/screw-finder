import type { CwScrewItem, CwScrewsDocument } from "./model";

export interface CwScrewEntry {
  /** Zero-based index in {@link buildScrewEntries} output order (stable route key). */
  listIndex: number;
  // identity — row key `${catalogItemIndex}:${lengthVariantIndex}`; catalogItemIndex indexes {@link CwScrewsDocument.items}.
  id: string;
  /** Zero-based index into {@link CwScrewsDocument.items} (string for stable joins / display). */
  itemId: string;

  /** Folder path from connector (flattened VbaItemFolders). */
  folderPath?: string;

  // length-variant
  lengthMm: number;
  threadLengthMm?: number;
  threadLength2Mm?: number;
  lengthWeightKg?: number;
  lengthOrderNumber?: string;

  // condensed attributes
  name?: string;
  shortName?: string;
  material?: string;
  norm?: string;

  // common fields (useful for filtering)
  manufacturer?: string;
  drive?: string;
  outerDiameterMm?: number;
  innerDiameterMm?: number;
  drillingDiameter2Mm?: number;
  isVisible?: boolean;
  isReadonly?: boolean;
}

function toEntry(
  item: CwScrewItem,
  catalogItemIndex: number,
  len: CwScrewItem["lengths"][number],
  withinItemIndex: number,
  listIndex: number,
): CwScrewEntry {
  // Must be unique across the whole dataset (used as the search-index primary key).
  // Some source rows can share the same length + empty orderNumber, so include index.
  const id = `${catalogItemIndex}:${withinItemIndex}`;
  return {
    listIndex,
    id,
    itemId: String(catalogItemIndex),

    folderPath: item.folderPath,

    lengthMm: len.lengthMm,
    threadLengthMm: len.threadLengthMm,
    threadLength2Mm: len.threadLength2Mm,
    lengthWeightKg: len.weightKg,
    lengthOrderNumber: len.orderNumber,

    name: item.attributes?.name,
    shortName: item.attributes?.shortName,
    material: item.attributes?.material,
    norm: item.attributes?.norm,

    manufacturer: item.manufacturer,
    drive: item.drive,
    outerDiameterMm: item.outerDiameterMm,
    innerDiameterMm: item.innerDiameterMm,
    drillingDiameter2Mm: item.drillingDiameter2Mm,
    isVisible: item.isVisible,
    isReadonly: item.isReadonly,
  };
}

/** Text blob indexed for fuzzy search (generic hook consumes this). */
export function getCwScrewEntrySearchText(r: CwScrewEntry): string {
  const parts = [
    r.name,
    r.shortName,
    r.material,
    r.norm,
    r.folderPath,
    r.manufacturer,
    r.drive,
    r.lengthOrderNumber,
    r.lengthMm != null ? `length ${r.lengthMm}` : undefined,
    r.outerDiameterMm != null ? `outer ${r.outerDiameterMm}` : undefined,
    r.innerDiameterMm != null ? `inner ${r.innerDiameterMm}` : undefined,
  ];
  return parts.filter(Boolean).join(" ");
}

export function buildScrewEntries(doc: CwScrewsDocument): CwScrewEntry[] {
  const rows: CwScrewEntry[] = [];
  let listIndex = 0;
  for (let catalogItemIndex = 0; catalogItemIndex < doc.items.length; catalogItemIndex++) {
    const item = doc.items[catalogItemIndex]!;
    // Some records might be missing lengths; still emit one row.
    if (!item.lengths.length) {
      rows.push(
        toEntry(
          item,
          catalogItemIndex,
          {
            lengthMm: 0,
            threadLengthMm: undefined,
            threadLength2Mm: undefined,
            weightKg: undefined,
            orderNumber: undefined,
          },
          0,
          listIndex++,
        ),
      );
      continue;
    }
    for (let i = 0; i < item.lengths.length; i++) {
      const len = item.lengths[i]!;
      rows.push(toEntry(item, catalogItemIndex, len, i, listIndex++));
    }
  }
  return rows;
}

