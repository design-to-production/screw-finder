import { AppNavbar } from '@/components/AppShell';
import { LandingHeroCanvasLoader } from '@/components/landing/LandingHeroCanvasLoader';
import { LandingLogoBackdrop } from '@/components/landing/LandingLogoBackdrop';
import { NavLinks } from '@/components/NavLinks';
import { SiteFooter } from '@/components/SiteFooter';
import Link from 'next/link';

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export default function Page() {
  return (
    <div className="relative flex h-[100svh] min-h-[100svh] flex-col overflow-hidden">
      <LandingLogoBackdrop />

      {/* flex-1 min-h-0: reliable height fill with fixed backdrop sibling; avoids h-full collapse */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden bg-d2p-bg/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-[2px]">
        <AppNavbar
          title={<span className="text-lg font-semibold tracking-tight text-d2p-ink">Home</span>}
          navRight={<NavLinks />}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
          <div>
            {/* overflow-x-hidden only — overflow-y hidden was clipping large heading ascenders */}
            <section className="relative overflow-x-hidden border-d2p-border px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
              <div
                className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-d2p-red/5 blur-3xl"
                aria-hidden
              />
              <div className="relative mx-auto max-w-6xl">
                <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] lg:gap-12">
                  <div className="text-center lg:text-left">
                    <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-d2p-ink sm:text-5xl md:text-6xl">
                      We mustard complexity — <span className="text-d2p-red">lets get screwed together</span>,
                      respectfully.
                    </h1>
                    <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-d2p-muted lg:mx-0">
                      Browse screw catalogs as a fast sortable table or visual cards — fuzzy search, printable detail
                      sheets, and static hosting friendly (no backend required).
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                      <Link
                        href="/table/"
                        className="inline-flex items-center gap-2 rounded-lg bg-d2p-red px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-d2p-red-dark"
                      >
                        Open table
                        <ArrowIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/cards/"
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-d2p-border bg-d2p-surface px-6 py-3 text-base font-semibold text-d2p-ink transition-colors hover:border-d2p-red/40 hover:bg-d2p-cream"
                      >
                        Card gallery
                      </Link>
                    </div>
                  </div>

                  <LandingHeroCanvasLoader />
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
              <h2 className="mb-10 text-center text-sm font-semibold uppercase tracking-[0.2em] text-d2p-muted">
                Two ways to work
              </h2>
              <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
                <Link
                  href="/table/"
                  className="group flex flex-col rounded-2xl border border-d2p-border bg-d2p-surface p-8 shadow-sm transition-all hover:border-d2p-red/35 hover:shadow-md"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-d2p-red">Spreadsheet</span>
                  <h3 className="mt-2 text-xl font-semibold text-d2p-ink group-hover:text-d2p-red">Table view</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-d2p-muted">
                    AG Grid with filters, sorting, and fuzzy search across the full catalog — built for scanning
                    hundreds of variants quickly.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-d2p-red">
                    Launch <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>

                <Link
                  href="/cards/"
                  className="group flex flex-col rounded-2xl border border-d2p-border bg-d2p-surface p-8 shadow-sm transition-all hover:border-d2p-red/35 hover:shadow-md"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-d2p-red">Visual</span>
                  <h3 className="mt-2 text-xl font-semibold text-d2p-ink group-hover:text-d2p-red">Cards</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-d2p-muted">
                    Preview-driven tiles with key dimensions and a path to the printable full card for each length
                    variant.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-d2p-red">
                    Browse <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </section>

            <section className="border-y border-d2p-border bg-d2p-cream/50 px-5 py-14 sm:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <blockquote className="text-lg font-medium leading-relaxed text-d2p-ink md:text-xl">
                  “From parametric planning to fabrication-ready data — Design-to-Production closes the loop between
                  idea and machine.”
                </blockquote>
                <p className="mt-6 text-sm text-d2p-muted">
                  Screw Finder is a small web companion for teams bridging digital planning and fabrication workflows.
                </p>
                <a
                  href="https://designtoproduction.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-d2p-red underline-offset-4 hover:underline"
                >
                  Visit Design-to-Production
                  <ArrowIcon className="h-4 w-4" />
                </a>
              </div>
            </section>
          </div>

          <SiteFooter />
        </main>
      </div>
    </div>
  );
}
