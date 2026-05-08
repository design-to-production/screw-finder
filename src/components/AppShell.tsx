"use client";

import type { ReactNode } from "react";

export type AppShellProps = {
  /** Left: route / screen title */
  title: ReactNode;
  /** Center: optional (e.g. fuzzy search on Table) */
  center?: ReactNode;
  /** Right: navigation */
  navRight: ReactNode;
  children: ReactNode;
};

/**
 * Full-viewport shell: top navbar + scrollable/flexible main.
 * Main uses flex-1 min-h-0 so children (e.g. AG Grid) can fill remaining height.
 */
export function AppShell({ title, center, navRight, children }: AppShellProps) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#242424]">
      <header className="shrink-0 border-b border-[#fbf0df]/25 bg-[#1a1a1a]/90 backdrop-blur-sm">
        <div className="flex min-h-11 items-center gap-2 px-2 py-1">
          <div className="w-[28%] min-w-0 shrink-0 flex items-center">
            <div className="truncate text-[#fbf0df]">{title}</div>
          </div>
          <div className="flex min-w-0 flex-1 justify-center px-0">{center}</div>
          <div className="w-[28%] min-w-0 shrink-0 flex justify-end items-center gap-2">{navRight}</div>
        </div>
      </header>
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
