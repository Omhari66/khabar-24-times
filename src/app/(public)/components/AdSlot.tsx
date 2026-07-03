"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AdCampaign {
  id: string;
  title: string;
  imageUrl: string | null;
  linkUrl: string;
}

export default function AdSlot({
  slotName,
  className = "",
}: {
  slotName: string;
  className?: string;
}) {
  const [ad, setAd] = useState<AdCampaign | null>(null);

  useEffect(() => {
    // In a real application, this would fetch from an API route like `/api/ads?slot=${slotName}`
    // For now, we simulate an empty response (no active campaigns) which acts as a fallback hook.
    setAd(null);
  }, [slotName]);

  const handleAdClick = async (campaignId: string) => {
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "AD_IMPRESSION",
        payload: { campaignId, actionType: "CLICK" },
      }),
    }).catch(console.error);
  };

  if (!ad) {
    // Google AdSense Fallback Hook
    return (
      <div className={`bg-surface-muted border border-structural flex items-center justify-center text-xs text-text-secondary uppercase tracking-widest ${className}`}>
        Advertisement
      </div>
    );
  }

  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => handleAdClick(ad.id)}
      className={`block relative border border-structural overflow-hidden group ${className}`}
    >
      <div className="absolute top-0 right-0 bg-black text-white text-[9px] uppercase px-1 z-10 opacity-70">
        Sponsored
      </div>
      {ad.imageUrl ? (
        <div className="relative w-full h-full">
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-text-primary p-4 text-center">
          <span className="font-sans font-bold">{ad.title}</span>
        </div>
      )}
    </a>
  );
}
