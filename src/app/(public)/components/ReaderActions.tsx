"use client";

import { Bookmark, BookmarkCheck, Heart, Link2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toggleLike } from "@/lib/actions/article-actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type SavedArticle = {
  slug: string;
  title: string;
};

const STORAGE_KEY = "newsportal:saved-articles";

export default function ReaderActions({
  articleId,
  slug,
  title,
  initialLikesCount = 0,
  initialIsLiked = false,
}: {
  articleId: string;
  slug: string;
  title: string;
  initialLikesCount?: number;
  initialIsLiked?: boolean;
}) {
  const router = useRouter();
  const { status } = useSession();
  
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLiking, setIsLiking] = useState(false);

  // Sync state if props change (e.g. via Server Action revalidation)
  useEffect(() => {
    setLikesCount(initialLikesCount);
    setIsLiked(initialIsLiked);
  }, [initialLikesCount, initialIsLiked]);

  useEffect(() => {
    const current = readSavedArticles();
    setSaved(current.some((article) => article.slug === slug));
  }, [slug]);

  const handleToggleLike = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    
    // Optimistic update
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiking(true);

    try {
      const res = await toggleLike(articleId, slug);
      if (!res.success) {
        // Revert on failure
        setIsLiked((prev) => !prev);
        setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
      }
    } catch {
      // Revert on failure
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

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
        onClick={handleToggleLike}
        disabled={isLiking}
        className={`inline-flex items-center gap-2 rounded-none border-2 px-4 py-2 text-xs font-condensed font-bold uppercase tracking-widest transition ${
          isLiked
            ? "border-rose-500 bg-rose-50 text-rose-600"
            : "border-structural bg-white text-text-secondary hover:border-rose-500 hover:text-rose-500"
        }`}
      >
        <Heart size={14} className={isLiked ? "fill-rose-500 text-rose-500" : ""} />
        {likesCount > 0 ? `${likesCount} Likes` : "Like"}
      </button>

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
