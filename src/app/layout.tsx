import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Work_Sans, Archivo_Narrow } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-condensed",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Khabar 24 Times | Reliable Indian News",
    template: "%s | Khabar 24 Times",
  },
  description:
    "A modern, authoritative newsroom experience with live reporting, deep analysis, and local news.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Khabar 24 Times",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSerif.variable} ${workSans.variable} ${archivoNarrow.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
