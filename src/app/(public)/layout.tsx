import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bharat Sentinel",
    "url": "https://www.bharatsentinel.in",
    "logo": "https://www.bharatsentinel.in/logo.png"
  };

  return (
    <div className="public-theme font-sans text-text-primary min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
