import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import { TrendingTagsTicker } from "./components/TrendingTagsTicker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Khabar 24 Times",
    "url": "https://www.khabar24times.in",
    "logo": "https://www.khabar24times.in/logo.png"
  };

  return (
    <div className="public-theme font-sans text-text-primary min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <TrendingTagsTicker />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
