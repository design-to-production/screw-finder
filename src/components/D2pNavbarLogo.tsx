type D2pNavbarLogoProps = {
  className?: string;
};

/** Official Design-to-Production wordmark — links to designtoproduction.com */
export function D2pNavbarLogo({ className = "" }: D2pNavbarLogoProps) {
  return (
    <a
      href="https://designtoproduction.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex shrink-0 items-center opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d2p-red/40 focus-visible:ring-offset-2 ${className}`}
      aria-label="Design-to-Production (opens in new tab)"
    >
      <img
        src="/d2p-logo.svg"
        alt=""
        className="h-7 w-auto sm:h-8"
        decoding="async"
      />
    </a>
  );
}
