import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Aditya Raj — Systems Bioengineer",
  description:
    "Making sense of living systems. Finding new ways to engineer them. An undergraduate researcher working at the intersection of biology, computation, and engineering.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${newsreader.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
