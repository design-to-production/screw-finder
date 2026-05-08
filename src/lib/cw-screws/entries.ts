import type { CwScrewItem, CwScrewsDocument } from "./model";

export interface CwScrewEntry {
  // identity
  itemId: string;
  elementType: number;

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

function toEntry(item: CwScrewItem, len: CwScrewItem["lengths"][number]): CwScrewEntry {
  return {
    itemId: item.id,
    elementType: item.elementType,

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

export function buildScrewEntries(doc: CwScrewsDocument): CwScrewEntry[] {
  const rows: CwScrewEntry[] = [];
  for (const item of doc.items) {
    // Some records might be missing lengths; still emit one row.
    if (!item.lengths.length) {
      rows.push(
        toEntry(item, {
          lengthMm: 0,
          threadLengthMm: undefined,
          threadLength2Mm: undefined,
          weightKg: undefined,
          orderNumber: undefined,
        }),
      );
      continue;
    }
    for (const len of item.lengths) {
      rows.push(toEntry(item, len));
    }
  }
  return rows;
}

