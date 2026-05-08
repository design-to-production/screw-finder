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

export type NavLinksProps = {
  /** `drawer`: stacked full-width targets for the mobile menu */
  layout?: "inline" | "drawer";
};

export function NavLinks({ layout = "inline" }: NavLinksProps) {
  const pathname = usePathname() ?? "";
  const drawer = layout === "drawer";

  const linkClass = (active: boolean) =>
    drawer
      ? `block w-full rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition-colors duration-150 ${
          active
            ? "bg-d2p-red text-white shadow-sm hover:bg-d2p-red-dark"
            : "text-d2p-ink hover:bg-d2p-red/10 hover:text-d2p-red"
        }`
      : `rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors duration-150 ${
          active
            ? "bg-d2p-red text-white shadow-sm hover:bg-d2p-red-dark"
            : "text-d2p-ink hover:bg-d2p-red/10 hover:text-d2p-red"
        }`;

  return (
    <nav
      className={
        drawer
          ? "flex w-full flex-col items-stretch gap-3"
          : "flex flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3"
      }
      aria-label="Main"
    >
      <div
        className={
          drawer ? "flex w-full flex-col gap-2" : "flex flex-wrap items-center justify-end gap-1"
        }
      >
        {links.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} className={linkClass(active)}>
              {label}
            </Link>
          );
        })}
      </div>
      <D2pNavbarLogo
        className={
          drawer
            ? "mx-auto border-t border-d2p-border pt-3 border-l-0 pl-0"
            : "border-l border-d2p-border pl-2 sm:pl-3"
        }
      />
    </nav>
  );
}
