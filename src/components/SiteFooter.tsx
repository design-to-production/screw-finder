export function SiteFooter() {
  return (
    <footer className="border-t border-d2p-border bg-d2p-cream/75 backdrop-blur-[1px]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm text-d2p-muted">
          Catalog tooling — search, browse, and export screw data in your browser.
        </p>
        <a
          href="https://designtoproduction.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-d2p-red underline-offset-4 transition-colors hover:text-d2p-red-dark hover:underline"
        >
          designtoproduction.com
        </a>
      </div>
    </footer>
  );
}
