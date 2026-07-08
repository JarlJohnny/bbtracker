import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "BB Tracker – Blood Bowl League Manager",
  description: "Track your Blood Bowl teams, matches, and leagues",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-stone-950 text-stone-100 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
