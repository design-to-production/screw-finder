"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ScrewSceneProps } from "./ScrewScene";

const ScrewScene = dynamic(() => import("./ScrewScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e] text-xs text-[#fbf0df]/35">
      Loading…
    </div>
  ),
});

export type ScrewCardPreviewProps = ScrewSceneProps & {
  className?: string;
};

/**
 * Renders the 3D screw only while the viewport intersects this container;
 * unmounts when scrolled away to drop WebGL work and memory.
 */
export function ScrewCardPreview({ className = "", ...scene }: ScrewCardPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

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

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden rounded-lg border border-[#fbf0df]/15 bg-[#1e1e1e] ${className}`}
    >
      {inView ? (
        <ScrewScene {...scene} />
      ) : (
        <div className="flex h-full min-h-[200px] w-full items-center justify-center text-[11px] text-[#fbf0df]/30">
          Preview off-screen
        </div>
      )}
    </div>
  );
}
