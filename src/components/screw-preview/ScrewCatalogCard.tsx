"use client";

import type { CwScrewEntry } from "@/lib/cw-screws/entries";
import Link from "next/link";
import { ScrewCardPreview } from "./ScrewCardPreview";

export type ScrewCatalogCardProps = {
  entry: CwScrewEntry;
  /** Highlights this card (e.g. the row whose full card is open). */
  current?: boolean;
};

/**
 * Shared catalog tile: preview image + summary fields, linking to `/fullcard/[listIndex]/`.
 */
export function ScrewCatalogCard({ entry, current = false }: ScrewCatalogCardProps) {
  const title = entry.name ?? entry.shortName ?? entry.itemId;
  return (
    <Link
      href={`/fullcard/${entry.listIndex}/`}
      className={`flex flex-col overflow-hidden rounded-xl border bg-d2p-surface shadow-sm outline-none transition-all hover:border-d2p-red/35 hover:shadow-md focus-visible:ring-2 focus-visible:ring-d2p-red/35 ${
        current ? "border-d2p-red ring-2 ring-d2p-red/30" : "border-d2p-border"
      }`}
    >
      <article className="flex min-h-0 flex-1 flex-col">
        <ScrewCardPreview
          className="aspect-[4/3] w-full shrink-0 min-h-[200px]"
          lengthMm={entry.lengthMm}
          outerDiameterMm={entry.outerDiameterMm}
          innerDiameterMm={entry.innerDiameterMm}
          threadLengthMm={entry.threadLengthMm}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 border-t border-d2p-border p-4">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug text-d2p-ink">{title}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-d2p-muted">
            {entry.shortName ? (
              <>
                <dt className="text-d2p-muted/80">Commercial designation</dt>
                <dd className="truncate text-d2p-ink">{entry.shortName}</dd>
              </>
            ) : null}
            {entry.driveSize != null && entry.driveSize !== "" ? (
              <>
                <dt className="text-d2p-muted/80">Drive</dt>
                <dd className="text-d2p-ink">{entry.driveSize}</dd>
              </>
            ) : entry.drive != null && entry.drive !== "" ? (
              <>
                <dt className="text-d2p-muted/80">Drive</dt>
                <dd className="truncate text-d2p-ink">{entry.drive}</dd>
              </>
            ) : null}
            {entry.driveType != null && entry.driveType !== "" ? (
              <>
                <dt className="text-d2p-muted/80">Drive type</dt>
                <dd className="truncate text-d2p-ink">{entry.driveType}</dd>
              </>
            ) : null}
            <dt className="text-d2p-muted/80">Length</dt>
            <dd className="text-d2p-ink">{entry.lengthMm} mm</dd>
            {entry.threadLengthMm != null ? (
              <>
                <dt className="text-d2p-muted/80">Thread</dt>
                <dd className="text-d2p-ink">{entry.threadLengthMm} mm</dd>
              </>
            ) : null}
            {entry.outerDiameterMm != null ? (
              <>
                <dt className="text-d2p-muted/80">Ø outer</dt>
                <dd className="text-d2p-ink">{entry.outerDiameterMm} mm</dd>
              </>
            ) : null}
            {entry.material ? (
              <>
                <dt className="text-d2p-muted/80">Material</dt>
                <dd className="line-clamp-1 text-d2p-ink">{entry.material}</dd>
              </>
            ) : null}
          </dl>
        </div>
      </article>
    </Link>
  );
}
