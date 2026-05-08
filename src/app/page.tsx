import { APITester } from "@/components/APITester";
import { AppShell } from "@/components/AppShell";
import { NavLinks } from "@/components/NavLinks";

export default function Page() {
  return (
    <AppShell
      title={<span className="text-lg font-semibold tracking-tight">Home</span>}
      navRight={<NavLinks />}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative z-10 mx-auto max-w-7xl p-8 text-center">
          <div className="mb-8 flex justify-center gap-8">
            <img
              src="logo.svg"
              alt="Bun Logo"
              className="h-24 w-24 scale-120 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
            />
            <img
              src="react.svg"
              alt="React Logo"
              className="h-24 w-24 animate-[spin_20s_linear_infinite] p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa]"
            />
          </div>

          <h1 className="my-4 text-5xl font-bold leading-tight">Next.js (Static) + React</h1>
          <p className="opacity-90">This site is exported as static files and hosted on GitHub Pages.</p>

          <APITester />
        </div>
      </div>
    </AppShell>
  );
}
