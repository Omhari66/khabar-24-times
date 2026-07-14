import Link from "next/link";
import Image from "next/image";
import { getCachedCategories } from "./getCachedCategories";
import { Mail, MapPin, Phone } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";
import {
  FacebookIcon,
  TwitterXIcon,
  YouTubeIcon,
  InstagramIcon,
} from "./SocialIcons";
import { SOCIAL_LINKS, CONTACT_INFO } from "@/lib/constants";

export default async function SiteFooter() {
  const categories = await getCachedCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-secondary text-white font-sans border-t-8 border-primary">
      {/* ── Main Footer Grid ── */}
      <div className="max-w-[1280px] mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* ── Column 1: Brand & Contact ── */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/logo.png"
              alt="Khabar 24 Times Logo"
              width={50}
              height={50}
              className="logo-spin rounded-full w-10 h-10 sm:w-[50px] sm:h-[50px]"
            />
            <div className="flex flex-col items-start leading-none">
              <span className="hidden sm:flex text-[10px] font-condensed font-bold tracking-widest text-primary-light uppercase items-center mb-1">
                <span className="logo-live-dot" aria-hidden="true" />
                The Daily Truth
              </span>
              <span className="text-xl sm:text-3xl font-serif font-black tracking-tight logo-text flex items-center">
                Khabar
                <span className="text-3xl sm:text-4xl text-primary bg-white px-1.5 sm:px-2 py-0.5 mx-1.5 sm:mx-2 rounded-sm transform -skew-x-12 inline-block leading-none shadow-md font-sans font-black">
                  24
                </span>
                Times
              </span>
            </div>
          </div>

          <p className="text-secondary-light text-sm leading-relaxed max-w-xs">
            A high-velocity, professional Indian news portal delivering authoritative,
            urgent, and deeply rooted journalistic integrity.
          </p>

          {/* Contact Details */}
          <div className="space-y-2.5 text-sm text-secondary-light">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-primary-light shrink-0" />
              <span>{CONTACT_INFO.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-primary-light shrink-0" />
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
                className="hover:text-white transition-colors"
              >
                {CONTACT_INFO.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-primary-light shrink-0" />
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="hover:text-white transition-colors break-all"
              >
                {CONTACT_INFO.email}
              </a>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div>
            <p className="text-xs font-condensed font-bold uppercase tracking-widest text-white/60 mb-3">
              Follow Us
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              <a
                id="footer-facebook-link"
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Khabar 24 Times on Facebook"
                className="flex items-center justify-center w-9 h-9 rounded-sm bg-[#1877F2] hover:bg-[#1565D8] text-white transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                id="footer-twitter-link"
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Khabar 24 Times on X (Twitter)"
                className="flex items-center justify-center w-9 h-9 rounded-sm bg-black hover:bg-zinc-800 text-white transition-colors border border-white/10"
              >
                <TwitterXIcon />
              </a>
              <a
                id="footer-instagram-link"
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Khabar 24 Times on Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-sm text-white transition-colors"
                style={{
                  background:
                    "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                }}
              >
                <InstagramIcon />
              </a>
              <a
                id="footer-youtube-link"
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to Khabar 24 Times on YouTube"
                className="flex items-center justify-center w-9 h-9 rounded-sm bg-[#FF0000] hover:bg-[#CC0000] text-white transition-colors"
              >
                <YouTubeIcon />
              </a>
            </div>
          </div>
        </div>

        {/* ── Column 2: Sections ── */}
        <div>
          <h3 className="text-lg font-condensed font-bold uppercase tracking-widest text-white mb-6 pb-2 border-b border-white/30 pl-3 border-l-4 border-l-primary">
            Sections
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <Link href="/" className="text-secondary-light hover:text-white transition-colors">
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-secondary-light hover:text-white transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Column 3: Quick Links ── */}
        <div>
          <h3 className="text-lg font-condensed font-bold uppercase tracking-widest text-white mb-6 pb-2 border-b border-white/30 pl-3 border-l-4 border-l-primary">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/search" className="text-secondary-light hover:text-white transition-colors">Search Archive</Link></li>
            <li><Link href="/about" className="text-secondary-light hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="text-secondary-light hover:text-white transition-colors">Contact Editorial</Link></li>
            <li><Link href="/privacy-policy" className="text-secondary-light hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-secondary-light hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/editorial-policy" className="text-secondary-light hover:text-white transition-colors">Editorial Policy</Link></li>
            <li><Link href="/disclaimer" className="text-secondary-light hover:text-white transition-colors">Disclaimer</Link></li>
          </ul>
        </div>

        {/* ── Column 4: Newsletter ── */}
        <div>
          <h3 className="text-lg font-condensed font-bold uppercase tracking-widest text-white mb-6 pb-2 border-b border-white/30 pl-3 border-l-4 border-l-primary">
            Newsletter
          </h3>
          <p className="text-secondary-light text-sm mb-4 leading-relaxed">
            Get the day&apos;s top headlines delivered straight to your inbox.
            No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-secondary-dark bg-secondary-dark">
        <div className="max-w-[1280px] mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary-light font-condensed tracking-wider uppercase">
          <p>&copy; {year} Khabar 24 Times. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
