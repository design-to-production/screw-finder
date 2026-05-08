"use client";

import { AppShell } from "@/components/AppShell";
import { NavLinks } from "@/components/NavLinks";
import { parseCwScrewsVbax } from "@/lib/cw-screws/parse";
import { useMemo, useState } from "react";

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function VbaxToJsonPage() {
  const [fileName, setFileName] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [error, setError] = useState<string>("");

  const parsed = useMemo(() => {
    if (!rawText) return null;
    try {
      setError("");
      return parseCwScrewsVbax(rawText);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }, [rawText]);

  return (
    <AppShell
      title={<span className="text-lg font-semibold tracking-tight text-d2p-ink">VBAx → JSON</span>}
      navRight={<NavLinks />}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl p-6 sm:p-8">
          <p className="mb-6 leading-relaxed text-d2p-muted">
            Upload a connector XML export (e.g. <code className="rounded bg-d2p-cream px-1.5 py-0.5 font-mono text-sm text-d2p-ink">.vbax</code> or{" "}
            <code className="rounded bg-d2p-cream px-1.5 py-0.5 font-mono text-sm text-d2p-ink">.xml</code>) and get a clean JSON model.
            This runs entirely in your browser (works on GitHub Pages).
          </p>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-d2p-border bg-d2p-surface p-5 shadow-sm">
              <label className="mb-2 block font-mono text-sm font-medium text-d2p-ink">Upload .vbax</label>
              <input
                type="file"
                accept=".vbax,.xml,text/xml"
                className="block w-full text-sm text-d2p-ink file:mr-3 file:rounded-md file:border-0 file:bg-d2p-red file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-d2p-red-dark"
                onChange={async e => {
                  const f = e.currentTarget.files?.[0];
                  if (!f) return;
                  setFileName(f.name);
                  setRawText(await f.text());
                }}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border-0 bg-d2p-red px-4 py-2 font-bold text-white transition-all duration-100 hover:-translate-y-px hover:bg-d2p-red-dark disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!parsed}
                  onClick={() => {
                    if (!parsed) return;
                    downloadJson(
                      (fileName.replace(/\.[^.]+$/, "") || "screw_catalog") + ".json",
                      parsed,
                    );
                  }}
                >
                  Download JSON
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border-2 border-d2p-border bg-transparent px-4 py-2 font-bold text-d2p-ink transition-colors duration-100 hover:border-d2p-red/40 hover:bg-d2p-cream"
                  onClick={() => {
                    setFileName("");
                    setRawText("");
                    setError("");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-mono text-sm whitespace-pre-wrap text-red-800">
                {error}
              </div>
            ) : null}

            {parsed ? (
              <div className="rounded-xl border border-d2p-border bg-d2p-surface p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="font-mono text-sm text-d2p-muted">
                    Items: <span className="font-bold text-d2p-ink">{parsed.items.length}</span>
                  </div>
                  <div className="font-mono text-sm text-d2p-muted">
                    Modified: <span className="text-d2p-ink">{parsed.meta.modified ?? "—"}</span>
                  </div>
                </div>
                <textarea
                  readOnly
                  className="min-h-[420px] w-full resize-y rounded-lg border border-d2p-border bg-d2p-bg p-3 font-mono text-xs text-d2p-ink outline-none"
                  value={JSON.stringify(parsed, null, 2)}
                />
              </div>
            ) : (
              <div className="text-sm text-d2p-muted">Upload a file to see the parsed JSON preview here.</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
