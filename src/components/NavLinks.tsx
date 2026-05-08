"use client";

import { D2pNavbarLogo } from "@/components/D2pNavbarLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/table", label: "Table" },
  { href: "/cards", label: "Cards" },
] as const;

function normalizePath(p: string): string {
  const s = p.replace(/\/$/, "") || "/";
  return s;
}

function isActive(pathname: string, href: string): boolean {
  return normalizePath(pathname) === normalizePath(href);
}

export function NavLinks() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="flex flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3"
      aria-label="Main"
    >
      <div className="flex flex-wrap items-center justify-end gap-1">
        {links.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors duration-150 ${
                active
                  ? "bg-d2p-red text-white shadow-sm hover:bg-d2p-red-dark"
                  : "text-d2p-ink hover:bg-d2p-red/10 hover:text-d2p-red"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <D2pNavbarLogo className="border-l border-d2p-border pl-2 sm:pl-3" />
    </nav>
  );
}
