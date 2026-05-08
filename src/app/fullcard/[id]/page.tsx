import { FullCardPdfDownload } from "@/components/fullcard/FullCardPdfDownload";
import { AppShell } from "@/components/AppShell";
import { NavLinks } from "@/components/NavLinks";
import { ScrewCatalogCard } from "@/components/screw-preview/ScrewCatalogCard";
import { ScrewCardPreview } from "@/components/screw-preview/ScrewCardPreview";
import { d2pRecordToFlatRows } from "@/lib/cw-screws/d2pCatalog";
import type { CwScrewEntry } from "@/lib/cw-screws/entries";
import { buildFullCardPdfModel, fullCardPdfFilename } from "@/lib/cw-screws/fullCardPdfModel";
import { cwScrewEntryList, cwScrewsDocument } from "@/lib/cw-screws/screwDataset";
import type { CwScrewItem } from "@/lib/cw-screws/model";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export function generateStaticParams() {
  return cwScrewEntryList.map((_, i) => ({ id: String(i) }));
}

function fmt(v: unknown): ReactNode {
  if (v === undefined || v === null || v === "") return <span className="text-d2p-muted/50">—</span>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "—";
  if (typeof v === "object") return <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(v, null, 2)}</pre>;
  return String(v);
}

function FieldGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[minmax(9rem,auto)_1fr] gap-x-4 gap-y-2 text-sm">
      {rows.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="text-d2p-muted">{label}</dt>
          <dd className="min-w-0 text-d2p-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function entryRows(row: CwScrewEntry): { label: string; value: ReactNode }[] {
  return [
    { label: "List index", value: fmt(row.listIndex) },
    { label: "Row id", value: fmt(row.id) },
    { label: "Catalog item index", value: fmt(row.itemId) },
    { label: "Folder path", value: fmt(row.folderPath) },
    { label: "Name", value: fmt(row.name) },
    { label: "Commercial designation", value: fmt(row.shortName) },
    { label: "Material", value: fmt(row.material) },
    { label: "Norm", value: fmt(row.norm) },
    { label: "Manufacturer", value: fmt(row.manufacturer) },
    { label: "Drive", value: fmt(row.driveSize ?? row.drive) },
    { label: "Drive type", value: fmt(row.driveType) },
    { label: "Length", value: row.lengthMm != null ? `${row.lengthMm} mm` : "—" },
    { label: "Thread length", value: row.threadLengthMm != null ? `${row.threadLengthMm} mm` : "—" },
    { label: "Thread length 2", value: row.threadLength2Mm != null ? `${row.threadLength2Mm} mm` : "—" },
    { label: "Weight (variant)", value: row.lengthWeightKg != null ? `${row.lengthWeightKg} kg` : "—" },
    { label: "Order # (variant)", value: fmt(row.lengthOrderNumber) },
    { label: "Ø outer", value: row.outerDiameterMm != null ? `${row.outerDiameterMm} mm` : "—" },
    { label: "Ø inner", value: row.innerDiameterMm != null ? `${row.innerDiameterMm} mm` : "—" },
    { label: "Ø drilling (2)", value: row.drillingDiameter2Mm != null ? `${row.drillingDiameter2Mm} mm` : "—" },
    { label: "Visible", value: fmt(row.isVisible) },
    { label: "Read-only", value: fmt(row.isReadonly) },
  ];
}

function itemRows(item: CwScrewItem): { label: string; value: ReactNode }[] {
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Folder path", value: fmt(item.folderPath) },
    { label: "Folder names (i18n)", value: fmt(item.folderNames) },
    { label: "Folder read-only", value: fmt(item.folderIsReadonly) },
    { label: "Thickness", value: item.thicknessMm != null ? `${item.thicknessMm} mm` : "—" },
    { label: "Ø outer", value: item.outerDiameterMm != null ? `${item.outerDiameterMm} mm` : "—" },
    { label: "Ø inner", value: item.innerDiameterMm != null ? `${item.innerDiameterMm} mm` : "—" },
    { label: "Ø drilling 1", value: item.drillingDiameter1Mm != null ? `${item.drillingDiameter1Mm} mm` : "—" },
    { label: "Ø drilling 2", value: item.drillingDiameter2Mm != null ? `${item.drillingDiameter2Mm} mm` : "—" },
    { label: "Drilling depth", value: item.drillingDepthMm != null ? `${item.drillingDepthMm} mm` : "—" },
    { label: "Representation symbol", value: fmt(item.representationSymbol) },
    { label: "Opening width", value: item.openingWidthMm != null ? `${item.openingWidthMm} mm` : "—" },
    { label: "On both sides", value: fmt(item.onBothSides) },
    { label: "Weight (item)", value: item.weightKg != null ? `${item.weightKg} kg` : "—" },
    { label: "Overlength", value: item.overlengthMm != null ? `${item.overlengthMm} mm` : "—" },
    { label: "Drive", value: fmt(item.drive) },
    { label: "Dimension 1 / 2 / 3", value: fmt([item.dimensionValue1, item.dimensionValue2, item.dimensionValue3]) },
    { label: "Drilling value 1 / 2 / 3", value: fmt([item.drillingValue1, item.drillingValue2, item.drillingValue3]) },
    { label: "Manufacturer", value: fmt(item.manufacturer) },
    { label: "Order # (item)", value: fmt(item.orderNumber) },
    { label: "Visible", value: fmt(item.isVisible) },
    { label: "Read-only", value: fmt(item.isReadonly) },
  ];

  if (item.userFields && Object.keys(item.userFields).length > 0) {
    rows.push({ label: "User fields", value: fmt(item.userFields) });
  }

  return rows;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FullCardPage({ params }: PageProps) {
  const { id } = await params;
  const idx = Number.parseInt(id, 10);
  if (!Number.isFinite(idx) || idx < 0 || idx >= cwScrewEntryList.length) {
    notFound();
  }

  const row = cwScrewEntryList[idx]!;
  const catalogItemIdx = Number.parseInt(row.itemId, 10);
  const item =
    Number.isFinite(catalogItemIdx) &&
    catalogItemIdx >= 0 &&
    catalogItemIdx < cwScrewsDocument.items.length
      ? cwScrewsDocument.items[catalogItemIdx]
      : undefined;
  const title = row.name ?? row.shortName ?? row.itemId;

  const pdfModel = buildFullCardPdfModel(row, item, idx, cwScrewEntryList.length);

  return (
    <AppShell
      title={<span className="text-lg font-semibold tracking-tight text-d2p-ink">Full card</span>}
      navRight={<NavLinks />}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-5">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/cards/"
              className="rounded border border-d2p-border px-2 py-1 text-d2p-ink transition-colors hover:bg-d2p-cream"
            >
              ← Cards
            </Link>
            <Link
              href="/table/"
              className="rounded border border-d2p-border px-2 py-1 text-d2p-ink transition-colors hover:bg-d2p-cream"
            >
              Table
            </Link>
            <span className="text-d2p-muted">
              List index{" "}
              <span className="font-mono text-d2p-ink">{idx}</span>
              <span className="mx-1 text-d2p-muted/60">/</span>
              <span className="font-mono">{cwScrewEntryList.length}</span>
              <span className="ml-1">entries</span>
            </span>
            <FullCardPdfDownload
              model={pdfModel}
              filename={fullCardPdfFilename(idx, title)}
              preview={{
                lengthMm: row.lengthMm,
                outerDiameterMm: row.outerDiameterMm,
                innerDiameterMm: row.innerDiameterMm,
                threadLengthMm: row.threadLengthMm,
              }}
            />
          </div>

          <section className="overflow-hidden rounded-xl border border-d2p-border bg-d2p-surface shadow-sm">
            <div className="grid gap-4 border-b border-d2p-border p-4 md:grid-cols-[minmax(0,280px)_1fr] md:items-start">
              <ScrewCardPreview
                className="aspect-[4/3] w-full max-w-sm shrink-0 rounded-lg min-h-[200px]"
                lengthMm={row.lengthMm}
                outerDiameterMm={row.outerDiameterMm}
                innerDiameterMm={row.innerDiameterMm}
                threadLengthMm={row.threadLengthMm}
              />
              <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-snug text-d2p-ink">{title}</h1>
                <p className="mt-1 font-mono text-xs text-d2p-muted">
                  {row.d2p ? (
                    <>
                      <span className="text-d2p-ink/90">{row.d2p.screw_key}</span>
                      <span className="mx-1.5 text-d2p-muted/50">·</span>
                    </>
                  ) : null}
                  Item #{row.itemId}
                  {row.folderPath ? (
                    <span className="block text-d2p-muted/90">{row.folderPath}</span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="space-y-6 p-4">
              {row.d2p ? (
                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-d2p-red">
                    D2P catalog record
                  </h2>
                  <FieldGrid rows={d2pRecordToFlatRows(row.d2p)} />
                </section>
              ) : null}

              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-d2p-red">
                  Flattened row (search index)
                </h2>
                <FieldGrid rows={entryRows(row)} />
              </section>

              {item && !row.d2p ? (
                <>
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-d2p-red">
                      Source catalog item
                    </h2>
                    <FieldGrid rows={itemRows(item)} />
                  </section>

                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-d2p-red">
                      Length variants on item ({item.lengths.length})
                    </h2>
                    <div className="grid w-full gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,24rem),1fr))]">
                      {item.lengths.map((_, i) => {
                        const variantEntry = cwScrewEntryList.find(r => r.id === `${catalogItemIdx}:${i}`);
                        if (!variantEntry) return null;
                        return (
                          <ScrewCatalogCard
                            key={variantEntry.id}
                            entry={variantEntry}
                            current={variantEntry.id === row.id}
                          />
                        );
                      })}
                    </div>
                  </section>
                </>
              ) : null}

              {!item ? (
                <p className="text-sm text-amber-800">Catalog item not found for this row.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
