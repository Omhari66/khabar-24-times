"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface AdBannerProps {
  slotName: string;
  className?: string;
}

interface AdData {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  scriptCode?: string;
}

export function AdBanner({ slotName, className = "" }: AdBannerProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [impressionLogged, setImpressionLogged] = useState(false);

  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch(`/api/ads/serve?slotName=${slotName}`);
        if (res.ok) {
          const data = await res.json();
          setAd(data);
        }
      } catch (e) {
        console.error("Failed to load ad:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAd();
  }, [slotName]);

  useEffect(() => {
    if (ad && !impressionLogged) {
      // Log view
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: ad.id, type: "VIEW" })
      }).catch(console.error);
      setImpressionLogged(true);
    }
  }, [ad, impressionLogged]);

  const handleAdClick = () => {
    if (!ad) return;
    fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: ad.id, type: "CLICK" })
    }).catch(console.error);
  };

  if (loading) return null; // Or a skeleton if preferred
  if (!ad) return null;

  const formattedUrl = ad.linkUrl
    ? (ad.linkUrl.startsWith("http") ? ad.linkUrl : `https://${ad.linkUrl}`)
    : "#";

  return (
    <div className={`relative overflow-hidden flex justify-center items-center my-4 ${className}`}>
      <span className="absolute top-0 right-0 bg-slate-900/40 text-white text-[10px] px-1 rounded-bl z-10 font-sans">ADVERTISEMENT</span>
      
      {ad.scriptCode ? (
        <div 
          className="w-full"
          dangerouslySetInnerHTML={{ __html: ad.scriptCode }} 
        />
      ) : ad.imageUrl ? (
        <Link href={formattedUrl} target="_blank" rel="noopener noreferrer" onClick={handleAdClick} className="block w-full">
          <div className="relative w-full flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`/_next/image?url=${encodeURIComponent(ad.imageUrl)}&w=1080&q=75`}
              alt={ad.title || "Advertisement"} 
              className="w-full h-auto max-h-[250px] object-contain rounded-md"
            />
          </div>
        </Link>
      ) : null}
    </div>
  );
}
