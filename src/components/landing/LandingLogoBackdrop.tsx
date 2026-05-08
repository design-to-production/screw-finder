'use client';

import Link from 'next/link';

const D2P_HOME = 'https://designtoproduction.com/#vorwort';
const D2P_ANIMATED_LOGO = 'https://www.d2p.ch/logo/?color=ffffff&notext&animate';

/** Full-viewport fixed layer: animated mark centered on brand red. */
export function LandingLogoBackdrop() {
  return (
    <div
      id="sublogo"
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden bg-d2p-red"
    >
      <div className="flex h-[100svh] min-h-0 w-full items-center justify-center px-4 py-6 sm:px-8">
        <Link
          href={D2P_HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center justify-center transition-opacity hover:opacity-90"
          aria-label="Design-to-Production home"
        >
          <img
            src={D2P_ANIMATED_LOGO}
            alt=""
            className="genericlogo aspect-square h-auto w-[min(86svh,94vw)] max-h-[96svh] max-w-[min(96svh,96vw)] object-contain sm:w-[min(84svh,90vw)] md:w-[min(82svh,50vw)] lg:w-[min(77svh,43vw)]"
            decoding="async"
          />
        </Link>
      </div>
    </div>
  );
}
