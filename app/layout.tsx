import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Byun DateRange Picker",
  description:
    "A full-featured React date range picker with presets, optional time & timezone inputs, 3-click selection UX, and WCAG 2.2 AA accessibility.",
  keywords: [
    "react",
    "date range picker",
    "date picker",
    "tailwindcss",
    "shadcn",
    "radix ui",
    "typescript",
    "next.js",
  ],
  authors: [{ name: "Hyunghwan Byun" }],
  openGraph: {
    title: "Byun DateRange Picker",
    description:
      "A full-featured React date range picker with presets, time, timezone, and 3-click selection UX.",
    url: "https://daterangepicker.sqncs.com",
    siteName: "Byun DateRange Picker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Byun DateRange Picker",
    description:
      "A full-featured React date range picker with presets, time, timezone, and 3-click selection UX.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
