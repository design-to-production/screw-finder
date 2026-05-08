import type { CwScrewEntry } from "./entries";
import type { D2pCatalogFile, D2pScrewRecord } from "./d2pCatalogSchema";
import type { CwScrewItem, CwScrewsDocument } from "./model";

function humanizeDriveTypeKey(key: string): string {
  return key.replace(/_/g, " ");
}

function materialLabel(r: D2pScrewRecord): string {
  const mf = r.material_finish;
  if (!mf) return "";
  const { base_material_key, manufacturer_coating_name } = mf;
  return [base_material_key.replace(/_/g, " "), manufacturer_coating_name].filter(Boolean).join(" · ");
}

/** Maps one D2P JSON row to a connector-shaped item (single length variant). */
export function d2pRecordToCwItem(r: D2pScrewRecord): CwScrewItem {
  const mat = materialLabel(r);
  return {
    attributes: {
      name: r.internal_designation,
      shortName: r.commercial_designation,
      material: mat,
      norm: r.standard,
    },
    folderPath: r.product_family,
    manufacturer: r.manufacturer_key,
    drive: r.geometry.drive_size,
    outerDiameterMm: r.geometry.nominal_diameter_mm,
    innerDiameterMm: r.geometry.core_diameter_mm ?? undefined,
    lengths: [
      {
        lengthMm: r.geometry.overall_length_mm,
        threadLengthMm: r.geometry.thread_length_mm,
        orderNumber: r.article_number,
      },
    ],
  };
}

export function d2pRecordToEntry(r: D2pScrewRecord, catalogItemIndex: number, listIndex: number): CwScrewEntry {
  const g = r.geometry;
  return {
    listIndex,
    id: `${catalogItemIndex}:0`,
    itemId: String(catalogItemIndex),
    folderPath: r.product_family,
    lengthMm: g.overall_length_mm,
    threadLengthMm: g.thread_length_mm,
    threadLength2Mm: undefined,
    lengthWeightKg: undefined,
    lengthOrderNumber: r.article_number,
    name: r.internal_designation,
    shortName: r.commercial_designation,
    material: materialLabel(r),
    norm: r.standard,
    manufacturer: r.manufacturer_key,
    drive: g.drive_size,
    driveSize: g.drive_size,
    driveType: humanizeDriveTypeKey(g.drive_type),
    outerDiameterMm: g.nominal_diameter_mm,
    innerDiameterMm: g.core_diameter_mm ?? undefined,
    drillingDiameter2Mm: undefined,
    isVisible: undefined,
    isReadonly: undefined,
    d2p: r,
  };
}

/** Label/value rows for PDF and full-card UI (structured D2P fields). */
export function d2pRecordToFlatRows(r: D2pScrewRecord): { label: string; value: string }[] {
  const g = r.geometry;
  const mf = r.material_finish;
  const rows: { label: string; value: string }[] = [
    { label: "Screw key", value: r.screw_key },
    { label: "Manufacturer", value: r.manufacturer_key },
    { label: "Article number", value: r.article_number },
    { label: "Internal designation", value: r.internal_designation },
    { label: "Commercial designation", value: r.commercial_designation },
    { label: "Product family", value: r.product_family },
    { label: "Standard", value: r.standard },
    { label: "ETA", value: r.eta_number },
    { label: "CE marked", value: r.ce_marked ? "Yes" : "No" },
    { label: "Declaration of performance", value: r.declaration_of_performance_number },
    { label: "Overall length", value: `${g.overall_length_mm} mm` },
    { label: "Nominal diameter", value: `${g.nominal_diameter_mm} mm` },
    { label: "Head shape", value: g.head_shape.replace(/_/g, " ") },
    { label: "Head diameter", value: `${g.head_diameter_mm} mm` },
    {
      label: "Core diameter",
      value: g.core_diameter_mm != null ? `${g.core_diameter_mm} mm` : "—",
    },
    { label: "Drive", value: g.drive_size },
    { label: "Drive type", value: humanizeDriveTypeKey(g.drive_type) },
    { label: "Thread type", value: g.thread_type.replace(/_/g, " ") },
    { label: "Thread length", value: `${g.thread_length_mm} mm` },
    {
      label: "Base material",
      value: mf ? mf.base_material_key.replace(/_/g, " ") : "—",
    },
    {
      label: "Manufacturer coating",
      value: mf ? mf.manufacturer_coating_name : "—",
    },
    {
      label: "Sliding coated",
      value: mf ? (mf.sliding_coated ? "Yes" : "No") : "—",
    },
  ];
  const ean = r.logistics?.ean;
  if (ean) rows.push({ label: "EAN", value: ean });
  return rows;
}

export function buildCatalogFromD2pFile(file: D2pCatalogFile): {
  document: CwScrewsDocument;
  entries: CwScrewEntry[];
} {
  const screws = file.screws ?? [];
  const items = screws.map(d2pRecordToCwItem);
  const document: CwScrewsDocument = {
    meta: {
      editor: "d2p-catalog",
      version: "new_data_model",
    },
    items,
  };
  const entries = screws.map((r, i) => d2pRecordToEntry(r, i, i));
  return { document, entries };
}
