"use client";

import dynamic from "next/dynamic";

const LandingHeroCanvas = dynamic(
  () =>
    import("@/components/landing/LandingHeroCanvas").then(m => ({
      default: m.LandingHeroCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[220px] w-full min-h-[180px] animate-pulse rounded-2xl border border-d2p-border bg-d2p-bg sm:h-[280px] lg:h-[min(360px,42vh)]"
        aria-hidden
      />
    ),
  },
);

export function LandingHeroCanvasLoader() {
  return <LandingHeroCanvas />;
}
