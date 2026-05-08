import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screw Finder",
  description: "Static Next.js app hosted on GitHub Pages.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

