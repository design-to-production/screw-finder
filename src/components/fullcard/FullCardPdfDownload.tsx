"use client";

import { FullCardPdfDocument } from "@/components/fullcard/FullCardPdfDocument";
import type { FullCardPdfModel } from "@/lib/cw-screws/fullCardPdfModel";
import { getScrewPreviewDataUrl, type ScrewPreviewParams } from "@/lib/screw-preview/screwPreviewImage";
import { pdf } from "@react-pdf/renderer";
import { useState } from "react";

type Props = {
  model: FullCardPdfModel;
  filename: string;
  /** Same dimensions as the cards preview — rendered off-screen and embedded in the PDF. */
  preview: ScrewPreviewParams;
};

export function FullCardPdfDownload({ model, filename, preview }: Props) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      let previewImageSrc: string | undefined;
      try {
        previewImageSrc = await getScrewPreviewDataUrl(preview);
      } catch {
        previewImageSrc = undefined;
      }

      const blob = await pdf(
        <FullCardPdfDocument model={{ ...model, previewImageSrc }} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void download()}
      disabled={busy}
      className="rounded border border-[#fbf0df]/35 bg-[#fbf0df]/10 px-3 py-1.5 text-sm font-medium text-[#fbf0df] transition-colors hover:bg-[#fbf0df]/18 disabled:opacity-50"
    >
      {busy ? "Preparing PDF…" : "Download PDF"}
    </button>
  );
}
