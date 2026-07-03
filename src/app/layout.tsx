import type { Metadata } from "next";
import { Source_Serif_4, Work_Sans, Archivo_Narrow } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-condensed",
});

export const metadata: Metadata = {
  title: {
    default: "Bharat Sentinel | Reliable Indian News",
    template: "%s | Bharat Sentinel",
  },
  description:
    "A modern, authoritative newsroom experience with live reporting, deep analysis, and local news.",
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
