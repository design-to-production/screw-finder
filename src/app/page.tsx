import { APITester } from "@/components/APITester";
import Image from "next/image";

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <div className="flex justify-center items-center gap-8 mb-8">
        <Image
          src="/logo.svg"
          alt="Bun Logo"
          width={96}
          height={96}
          className="h-24 w-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
          priority
        />
        <Image
          src="/react.svg"
          alt="React Logo"
          width={96}
          height={96}
          className="h-24 w-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[spin_20s_linear_infinite]"
          priority
        />
      </div>

      <h1 className="text-5xl font-bold my-4 leading-tight">Next.js (Static) + React</h1>
      <p className="opacity-90">
        This site is exported as static files and hosted on GitHub Pages.
      </p>

      <APITester />
    </div>
  );
}

