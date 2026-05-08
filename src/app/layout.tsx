import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

/** Warm catalog JSON + zustand slice as soon as the app shell loads (shared across routes). */
import "@/stores/screwDataStore";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-d2p",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Screw Finder · Design-to-Production",
  description:
    "Browse and search screw catalogs — table and card views with fuzzy search and printable detail sheets. A Design-to-Production tool.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
