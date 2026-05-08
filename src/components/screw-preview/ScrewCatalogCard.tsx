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
      className={`flex flex-col overflow-hidden rounded-xl border bg-[#1a1a1a]/90 shadow-sm outline-none transition-colors hover:border-[#f3d5a3]/35 hover:bg-[#1f1f1f]/90 focus-visible:ring-2 focus-visible:ring-[#f3d5a3]/50 ${
        current
          ? "border-[#f3d5a3]/50 ring-2 ring-[#f3d5a3]/40"
          : "border-[#fbf0df]/20"
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
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 border-t border-[#fbf0df]/10 p-4">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug text-[#fbf0df]">{title}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-[#fbf0df]/75">
            {entry.shortName ? (
              <>
                <dt className="text-[#fbf0df]/45">Short</dt>
                <dd className="truncate">{entry.shortName}</dd>
              </>
            ) : null}
            <dt className="text-[#fbf0df]/45">Length</dt>
            <dd>{entry.lengthMm} mm</dd>
            {entry.threadLengthMm != null ? (
              <>
                <dt className="text-[#fbf0df]/45">Thread</dt>
                <dd>{entry.threadLengthMm} mm</dd>
              </>
            ) : null}
            {entry.outerDiameterMm != null ? (
              <>
                <dt className="text-[#fbf0df]/45">Ø outer</dt>
                <dd>{entry.outerDiameterMm} mm</dd>
              </>
            ) : null}
            {entry.material ? (
              <>
                <dt className="text-[#fbf0df]/45">Material</dt>
                <dd className="line-clamp-1">{entry.material}</dd>
              </>
            ) : null}
          </dl>
        </div>
      </article>
    </Link>
  );
}
