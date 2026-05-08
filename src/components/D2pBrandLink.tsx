import Link from "next/link";

type D2pBrandLinkProps = {
  /** When true, single-line compact mark for the shell header. */
  compact?: boolean;
  className?: string;
};

/**
 * In-app link home — typography aligned with Design-to-Production wordmark + product name.
 */
export function D2pBrandLink({ compact = false, className = "" }: D2pBrandLinkProps) {
  if (compact) {
    return (
      <Link
        href="/"
        className={`group inline-flex min-w-0 items-baseline gap-1.5 text-left no-underline ${className}`}
      >
        <span className="truncate font-semibold tracking-tight text-d2p-ink transition-colors group-hover:text-d2p-red">
          Screw Finder
        </span>
        <span className="hidden shrink-0 text-[11px] font-medium uppercase tracking-[0.12em] text-d2p-muted sm:inline">
          D2P
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" className={`group inline-flex flex-col gap-0.5 no-underline ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-d2p-red">Design-to-Production</span>
      <span className="text-2xl font-semibold tracking-tight text-d2p-ink transition-colors group-hover:text-d2p-red md:text-3xl">
        Screw Finder
      </span>
    </Link>
  );
}
