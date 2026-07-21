"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import {
  FacebookIcon,
  TwitterXIcon,
  WhatsAppIcon,
  InstagramIcon,
} from "./SocialIcons";

interface ArticleShareButtonsProps {
  title: string;
  slug: string;
}

export function ArticleShareButtons({ title, slug }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = `https://khabar24times.in/article/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const whatsappUrl = `whatsapp://send?text=${encodedUrl}%0A%0A${encodedTitle}`;
  const whatsappWebUrl = `https://api.whatsapp.com/send?text=${encodedUrl}%0A%0A${encodedTitle}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=khabar24times`,
    whatsapp: whatsappWebUrl,
    // Instagram doesn't support direct URL sharing — opens the app/profile instead
    instagram: `https://www.instagram.com/khabar24times.in/`,
  };

  const handleWhatsAppShare = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // On mobile devices, try deep linking to WhatsApp app directly so it scrapes thumbnail
    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const targetUrl = isMobile ? whatsappUrl : whatsappWebUrl;
    window.open(targetUrl, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-condensed font-bold uppercase tracking-widest text-text-secondary mr-1">
        Share:
      </span>

      {/* Facebook */}
      <a
        id="article-share-facebook"
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-condensed font-bold uppercase tracking-wider text-white bg-[#1877F2] hover:bg-[#1565D8] transition-colors"
      >
        <FacebookIcon className="w-3.5 h-3.5" />
        Facebook
      </a>

      {/* X / Twitter */}
      <a
        id="article-share-twitter"
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        title="Share on X"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-condensed font-bold uppercase tracking-wider text-white bg-black hover:bg-zinc-800 transition-colors"
      >
        <TwitterXIcon className="w-3.5 h-3.5" />
        X / Twitter
      </a>

      {/* WhatsApp */}
      <a
        id="article-share-whatsapp"
        href={shareLinks.whatsapp}
        onClick={handleWhatsAppShare}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-condensed font-bold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#1daf55] transition-colors"
      >
        <WhatsAppIcon className="w-3.5 h-3.5" />
        WhatsApp
      </a>

      {/* Instagram — links to profile (no direct share API) */}
      <a
        id="article-share-instagram"
        href={shareLinks.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow on Instagram"
        title="Follow us on Instagram"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-condensed font-bold uppercase tracking-wider text-white transition-colors"
        style={{
          background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
        }}
      >
        <InstagramIcon className="w-3.5 h-3.5" />
        Instagram
      </a>

      {/* Copy Link */}
      <button
        id="article-share-copy"
        type="button"
        onClick={copyLink}
        aria-label="Copy article link"
        title="Copy link"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-condensed font-bold uppercase tracking-wider border-2 border-structural bg-white text-text-secondary hover:border-text-secondary hover:text-text-primary transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5" />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}
