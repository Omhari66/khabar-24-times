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
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
      >
        {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
        {saved ? "Saved" : "Save story"}
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
      >
        <Link2 size={15} />
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Share2 size={15} />
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
