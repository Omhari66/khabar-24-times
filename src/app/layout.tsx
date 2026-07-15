import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Work_Sans, Archivo_Narrow } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next";


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
  metadataBase: new URL("https://khabar24times.in"),

  title: {
    default: "Khabar 24 Times | Reliable Indian News",
    template: "%s | Khabar 24 Times",
  },

  description:
    "A modern, authoritative newsroom experience with live reporting, deep analysis, and local news.",

  keywords: [
    "India News",
    "Breaking News",
    "Hindi News",
    "Politics",
    "Sports",
    "Technology",
    "Entertainment",
    "Business",
    "Health",
    "Khabar 24 Times",
    "Latest News India",
    "UP News",
    "Auraiya",
    "Jalaun",
    "Etawah",
  ],

  manifest: "/manifest.json",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "Khabar 24 Times | Reliable Indian News",
    description:
      "A modern, authoritative newsroom experience with live reporting, deep analysis, and local news.",
    url: "https://khabar24times.in",
    siteName: "Khabar 24 Times",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Khabar 24 Times – Reliable Indian News",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Khabar 24 Times | Reliable Indian News",
    description:
      "A modern, authoritative newsroom experience with live reporting, deep analysis, and local news.",
    images: ["/og-image.jpg"],
  },

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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body
        className={`${sourceSerif.variable} ${workSans.variable} ${archivoNarrow.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}

