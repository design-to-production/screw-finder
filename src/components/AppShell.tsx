"use client";

import type { ReactNode } from "react";

export type AppNavbarProps = {
  /** Left: route / screen title */
  title: ReactNode;
  /** Center: optional (e.g. fuzzy search on Table / Cards) */
  center?: ReactNode;
  /** Right: navigation */
  navRight: ReactNode;
  /** Extra classes on the `<header>` (e.g. sticky landing bar) */
  className?: string;
};

/** Same top bar as {@link AppShell}; use directly when the page is not wrapped in the shell. */
export function AppNavbar({ title, center, navRight, className = "" }: AppNavbarProps) {
  return (
    <header className={`shrink-0 border-b-4 border-d2p-red bg-d2p-surface shadow-sm ${className}`}>
      <div className="flex min-h-12 items-center gap-2 px-3 py-2 sm:px-4">
        <div className="flex w-[28%] min-w-0 shrink-0 items-center">
          <div className="min-w-0 truncate text-d2p-ink">{title}</div>
        </div>
        <div className="flex min-w-0 flex-1 justify-center px-1">{center}</div>
        <div className="flex w-[28%] min-w-0 shrink-0 items-center justify-end gap-2">{navRight}</div>
      </div>
    </header>
  );
}

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
    <div className="flex h-[100svh] min-h-[100svh] flex-col overflow-hidden bg-d2p-bg">
      <AppNavbar title={title} center={center} navRight={navRight} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
