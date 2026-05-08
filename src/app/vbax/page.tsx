"use client";

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
    <div className="max-w-5xl mx-auto p-8 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">VBAx → JSON</h1>
        <p className="opacity-80 mt-2">
          Upload a cadwork connector export (like <code className="font-mono">CW_Screws.vbax</code>) and get a clean JSON model.
          This runs entirely in your browser (works on GitHub Pages).
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-4">
          <label className="block font-mono text-sm mb-2 opacity-90">Upload .vbax</label>
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
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              type="button"
              className="bg-[#fbf0df] text-[#1a1a1a] border-0 px-4 py-2 rounded-lg font-bold transition-all duration-100 hover:bg-[#f3d5a3] hover:-translate-y-px cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="bg-transparent text-[#fbf0df] border-2 border-[#fbf0df] px-4 py-2 rounded-lg font-bold transition-colors duration-100 hover:border-[#f3d5a3] hover:text-white cursor-pointer"
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
          <div className="bg-[#1a1a1a] border-2 border-red-400 rounded-xl p-4 text-red-200 font-mono text-sm whitespace-pre-wrap">
            {error}
          </div>
        ) : null}

        {parsed ? (
          <div className="bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="font-mono text-sm opacity-90">
                Items: <span className="font-bold">{parsed.items.length}</span>
              </div>
              <div className="font-mono text-sm opacity-80">
                Modified: <span className="opacity-100">{parsed.meta.modified ?? "—"}</span>
              </div>
            </div>
            <textarea
              readOnly
              className="w-full min-h-[420px] bg-transparent outline-none font-mono text-xs text-[#fbf0df] resize-y"
              value={JSON.stringify(parsed, null, 2)}
            />
          </div>
        ) : (
          <div className="opacity-70 text-sm">
            Upload a file to see the parsed JSON preview here.
          </div>
        )}
      </div>
    </div>
  );
}

