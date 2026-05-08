"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/table", label: "Table" },
  { href: "/cards", label: "Cards" },
  { href: "/vbax", label: "VBAx" },
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
    <nav className="flex flex-wrap items-center justify-end gap-0.5" aria-label="Main">
      {links.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-2 py-1 text-sm font-medium transition-colors duration-150 ${
              active
                ? "bg-[#fbf0df] text-[#1a1a1a] hover:bg-[#f3d5a3]"
                : "text-[#fbf0df]/85 hover:bg-[#fbf0df]/15 hover:text-[#fbf0df] active:bg-[#fbf0df]/10"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
