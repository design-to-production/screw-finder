"use client";

import type { ReactNode } from "react";
import { cloneElement, isValidElement, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavLinks, type NavLinksProps } from "@/components/NavLinks";

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

function HamburgerGlyph({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {open ? (
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
      ) : (
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      )}
    </svg>
  );
}

function navRightDrawerVariant(navRight: ReactNode): ReactNode {
  if (isValidElement<NavLinksProps>(navRight) && navRight.type === NavLinks) {
    return cloneElement(navRight, { layout: "drawer" });
  }
  return navRight;
}

/** Same top bar as {@link AppShell}; use directly when the page is not wrapped in the shell. */
export function AppNavbar({ title, center, navRight, className = "" }: AppNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header className={`relative z-50 shrink-0 border-b-4 border-d2p-red bg-d2p-surface shadow-sm ${className}`}>
      <div className="flex min-h-12 items-center gap-2 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center md:w-[28%] md:flex-none md:shrink-0">
          <div className="min-w-0 truncate text-d2p-ink">{title}</div>
        </div>
        <div className="hidden min-w-0 flex-1 justify-center px-1 md:flex">{center}</div>
        <div className="hidden w-[28%] min-w-0 shrink-0 items-center justify-end gap-2 md:flex">{navRight}</div>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-d2p-border text-d2p-ink transition-colors hover:bg-d2p-cream md:hidden"
          onClick={() => setMobileOpen(o => !o)}
          aria-expanded={mobileOpen}
          aria-controls="app-navbar-drawer"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <HamburgerGlyph open={mobileOpen} />
        </button>
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-d2p-ink/35 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="app-navbar-drawer"
            className="relative z-50 border-t border-d2p-border bg-d2p-surface px-3 py-4 shadow-inner md:hidden"
          >
            <div className="flex flex-col gap-4">
              {center ? <div className="w-full min-w-0">{center}</div> : null}
              <div className="w-full min-w-0">{navRightDrawerVariant(navRight)}</div>
            </div>
          </div>
        </>
      ) : null}
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
