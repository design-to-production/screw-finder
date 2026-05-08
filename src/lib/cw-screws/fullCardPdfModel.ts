import type { CwScrewEntry } from "./entries";
import type { CwScrewItem } from "./model";

function fmtStr(v: unknown): string {
  if (v === undefined || v === null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "—";
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

function entryRowsStr(row: CwScrewEntry): { label: string; value: string }[] {
  return [
    { label: "List index", value: fmtStr(row.listIndex) },
    { label: "Row id", value: fmtStr(row.id) },
    { label: "Catalog item index", value: fmtStr(row.itemId) },
    { label: "Folder path", value: fmtStr(row.folderPath) },
    { label: "Name", value: fmtStr(row.name) },
    { label: "Short name", value: fmtStr(row.shortName) },
    { label: "Material", value: fmtStr(row.material) },
    { label: "Norm", value: fmtStr(row.norm) },
    { label: "Manufacturer", value: fmtStr(row.manufacturer) },
    { label: "Drive", value: fmtStr(row.drive) },
    { label: "Length", value: row.lengthMm != null ? `${row.lengthMm} mm` : "—" },
    { label: "Thread length", value: row.threadLengthMm != null ? `${row.threadLengthMm} mm` : "—" },
    { label: "Thread length 2", value: row.threadLength2Mm != null ? `${row.threadLength2Mm} mm` : "—" },
    { label: "Weight (variant)", value: row.lengthWeightKg != null ? `${row.lengthWeightKg} kg` : "—" },
    { label: "Order # (variant)", value: fmtStr(row.lengthOrderNumber) },
    { label: "Ø outer", value: row.outerDiameterMm != null ? `${row.outerDiameterMm} mm` : "—" },
    { label: "Ø inner", value: row.innerDiameterMm != null ? `${row.innerDiameterMm} mm` : "—" },
    { label: "Ø drilling (2)", value: row.drillingDiameter2Mm != null ? `${row.drillingDiameter2Mm} mm` : "—" },
    { label: "Visible", value: fmtStr(row.isVisible) },
    { label: "Read-only", value: fmtStr(row.isReadonly) },
  ];
}

function itemRowsStr(item: CwScrewItem): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    { label: "Folder path", value: fmtStr(item.folderPath) },
    { label: "Folder names (i18n)", value: fmtStr(item.folderNames) },
    { label: "Folder read-only", value: fmtStr(item.folderIsReadonly) },
    { label: "Thickness", value: item.thicknessMm != null ? `${item.thicknessMm} mm` : "—" },
    { label: "Ø outer", value: item.outerDiameterMm != null ? `${item.outerDiameterMm} mm` : "—" },
    { label: "Ø inner", value: item.innerDiameterMm != null ? `${item.innerDiameterMm} mm` : "—" },
    { label: "Ø drilling 1", value: item.drillingDiameter1Mm != null ? `${item.drillingDiameter1Mm} mm` : "—" },
    { label: "Ø drilling 2", value: item.drillingDiameter2Mm != null ? `${item.drillingDiameter2Mm} mm` : "—" },
    { label: "Drilling depth", value: item.drillingDepthMm != null ? `${item.drillingDepthMm} mm` : "—" },
    { label: "Representation symbol", value: fmtStr(item.representationSymbol) },
    { label: "Opening width", value: item.openingWidthMm != null ? `${item.openingWidthMm} mm` : "—" },
    { label: "On both sides", value: fmtStr(item.onBothSides) },
    { label: "Weight (item)", value: item.weightKg != null ? `${item.weightKg} kg` : "—" },
    { label: "Overlength", value: item.overlengthMm != null ? `${item.overlengthMm} mm` : "—" },
    { label: "Drive", value: fmtStr(item.drive) },
    {
      label: "Dimension 1 / 2 / 3",
      value: fmtStr([item.dimensionValue1, item.dimensionValue2, item.dimensionValue3]),
    },
    {
      label: "Drilling value 1 / 2 / 3",
      value: fmtStr([item.drillingValue1, item.drillingValue2, item.drillingValue3]),
    },
    { label: "Manufacturer", value: fmtStr(item.manufacturer) },
    { label: "Order # (item)", value: fmtStr(item.orderNumber) },
    { label: "Visible", value: fmtStr(item.isVisible) },
    { label: "Read-only", value: fmtStr(item.isReadonly) },
  ];

  if (item.userFields && Object.keys(item.userFields).length > 0) {
    rows.push({ label: "User fields", value: fmtStr(item.userFields) });
  }

  return rows;
}

export type PdfFieldRow = { label: string; value: string };

export type FullCardPdfSection = { title: string; rows: PdfFieldRow[] };

export type FullCardPdfModel = {
  title: string;
  itemIdLine: string;
  listIndex: number;
  totalEntries: number;
  missingCatalogItem: boolean;
  sections: FullCardPdfSection[];
  /** PNG data URL from the same off-screen render as the cards page; filled client-side when exporting PDF. */
  previewImageSrc?: string;
};

export function fullCardPdfFilename(listIdx: number, title: string): string {
  const slug = title
    .slice(0, 48)
    .replace(/[^a-zA-Z0-9\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `fullcard-${listIdx}-${slug || "screw"}.pdf`;
}

export function buildFullCardPdfModel(
  row: CwScrewEntry,
  item: CwScrewItem | undefined,
  listIdx: number,
  totalEntries: number,
): FullCardPdfModel {
  const title = row.name ?? row.shortName ?? row.itemId;

  const sections: FullCardPdfSection[] = [
    { title: "Flattened row (search index)", rows: entryRowsStr(row) },
  ];

  if (item) {
    sections.push({ title: "Source catalog item", rows: itemRowsStr(item) });
  }

  return {
    title,
    itemIdLine: row.itemId,
    listIndex: listIdx,
    totalEntries,
    missingCatalogItem: item === undefined,
    sections,
  };
}
