import type { Metadata } from "next";
import "./globals.css";

/** Warm catalog JSON + zustand slice as soon as the app shell loads (shared across routes). */
import "@/stores/screwDataStore";

export const metadata: Metadata = {
  title: "Screw Finder",
  description: "Static Next.js app hosted on GitHub Pages.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh]">{children}</body>
    </html>
  );
}

