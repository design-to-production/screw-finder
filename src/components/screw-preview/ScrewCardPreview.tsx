"use client";

import {
  getScrewPreviewDataUrl,
  type ScrewPreviewParams,
} from "@/lib/screw-preview/screwPreviewImage";
import { useEffect, useRef, useState } from "react";

export type ScrewCardPreviewProps = ScrewPreviewParams & {
  className?: string;
};

/**
 * Renders a cached PNG snapshot from an off-screen WebGL pass. A snapshot is only
 * requested while the card intersects the viewport; results are memoized in-memory by geometry.
 */
export function ScrewCardPreview({ className = "", ...params }: ScrewCardPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      entries => {
        const e = entries[0];
        if (!e) return;
        setInView(e.isIntersecting);
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0,
      },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    let cancelled = false;
    setFailed(false);

    void (async () => {
      try {
        const url = await getScrewPreviewDataUrl(params);
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inView, params.lengthMm, params.outerDiameterMm, params.innerDiameterMm, params.threadLengthMm]);

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden rounded-lg border border-[#fbf0df]/15 bg-[#1e1e1e] ${className}`}
    >
      {dataUrl ? (
        <img src={dataUrl} alt="" className="h-full w-full object-cover" />
      ) : failed ? (
        <div className="flex h-full min-h-[200px] w-full items-center justify-center text-xs text-red-300/80">
          Preview failed
        </div>
      ) : inView ? (
        <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-[#1e1e1e] text-xs text-[#fbf0df]/35">
          Rendering…
        </div>
      ) : (
        <div className="flex h-full min-h-[200px] w-full items-center justify-center text-[11px] text-[#fbf0df]/30">
          Preview off-screen
        </div>
      )}
    </div>
  );
}
