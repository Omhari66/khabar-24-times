"use client";

import { Bookmark, BookmarkCheck, Link2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

type SavedArticle = {
  slug: string;
  title: string;
};

const STORAGE_KEY = "newsportal:saved-articles";

export default function ReaderActions({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const current = readSavedArticles();
    setSaved(current.some((article) => article.slug === slug));
  }, [slug]);

  const toggleSave = () => {
    const current = readSavedArticles();

    if (current.some((article) => article.slug === slug)) {
      const next = current.filter((article) => article.slug !== slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(false);
      return;
    }

    const next = [{ slug, title }, ...current].slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
      return;
    }

    await copyLink();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggleSave}
        className="inline-flex items-center gap-2 rounded-none border-2 border-structural bg-white px-4 py-2 text-xs font-condensed font-bold uppercase tracking-widest text-text-secondary transition hover:border-text-secondary hover:text-text-primary"
      >
        {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        {saved ? "Saved" : "Save"}
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-none border-2 border-structural bg-white px-4 py-2 text-xs font-condensed font-bold uppercase tracking-widest text-text-secondary transition hover:border-text-secondary hover:text-text-primary"
      >
        <Link2 size={14} />
        {copied ? "Copied" : "Copy Link"}
      </button>
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-none border-2 border-primary bg-primary px-4 py-2 text-xs font-condensed font-bold uppercase tracking-widest text-white transition hover:bg-primary-dark hover:border-primary-dark"
      >
        <Share2 size={14} />
        Share
      </button>
    </div>
  );
}

function readSavedArticles(): SavedArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
