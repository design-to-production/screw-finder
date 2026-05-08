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
      title={<span className="text-lg font-semibold tracking-tight">VBAx → JSON</span>}
      navRight={<NavLinks />}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl w-full p-6 sm:p-8">
          <p className="mb-6 opacity-80">
            Upload a cadwork connector export (like <code className="font-mono">CW_Screws.vbax</code>) and get a clean JSON model.
            This runs entirely in your browser (works on GitHub Pages).
          </p>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border-2 border-[#fbf0df] bg-[#1a1a1a] p-4">
              <label className="mb-2 block font-mono text-sm opacity-90">Upload .vbax</label>
              <input
                type="file"
                accept=".vbax,.xml,text/xml"
                className="block w-full"
                onChange={async e => {
                  const f = e.currentTarget.files?.[0];
                  if (!f) return;
                  setFileName(f.name);
                  setRawText(await f.text());
                }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border-0 bg-[#fbf0df] px-4 py-2 font-bold text-[#1a1a1a] transition-all duration-100 hover:-translate-y-px hover:bg-[#f3d5a3] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!parsed}
                  onClick={() => {
                    if (!parsed) return;
                    downloadJson(
                      (fileName.replace(/\.[^.]+$/, "") || "cw_screws") + ".json",
                      parsed,
                    );
                  }}
                >
                  Download JSON
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border-2 border-[#fbf0df] bg-transparent px-4 py-2 font-bold text-[#fbf0df] transition-colors duration-100 hover:border-[#f3d5a3] hover:text-white"
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
              <div className="rounded-xl border-2 border-red-400 bg-[#1a1a1a] p-4 font-mono text-sm whitespace-pre-wrap text-red-200">
                {error}
              </div>
            ) : null}

            {parsed ? (
              <div className="rounded-xl border-2 border-[#fbf0df] bg-[#1a1a1a] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="font-mono text-sm opacity-90">
                    Items: <span className="font-bold">{parsed.items.length}</span>
                  </div>
                  <div className="font-mono text-sm opacity-80">
                    Modified: <span className="opacity-100">{parsed.meta.modified ?? "—"}</span>
                  </div>
                </div>
                <textarea
                  readOnly
                  className="min-h-[420px] w-full resize-y bg-transparent font-mono text-xs text-[#fbf0df] outline-none"
                  value={JSON.stringify(parsed, null, 2)}
                />
              </div>
            ) : (
              <div className="text-sm opacity-70">Upload a file to see the parsed JSON preview here.</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

