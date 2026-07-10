"use client";

import React, { useState } from "react";
import { Loader2, Search, CheckCircle2, LayoutTemplate, Star, Flame, AlertOctagon } from "lucide-react";

interface Article {
  id: string;
  title: string;
  coverImageUrl: string | null;
  breaking: boolean;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
  category: { name: string };
  author: { name: string | null };
}

export default function HomepageBuilder({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const toggleFlag = async (articleId: string, flag: "breaking" | "featured" | "trending" | "editorsPick", currentValue: boolean) => {
    setIsUpdating(articleId);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [flag]: !currentValue })
      });
      if (res.ok) {
        setArticles(prev => prev.map(a => {
          if (flag === 'featured' && !currentValue) {
            if (a.id === articleId) return { ...a, featured: true };
            return { ...a, featured: false };
          }
          return a.id === articleId ? { ...a, [flag]: !currentValue } : a;
        }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update flag");
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const featured = articles.filter(a => a.featured);
  const breaking = articles.filter(a => a.breaking);
  const trending = articles.filter(a => a.trending);
  const editorsPick = articles.filter(a => a.editorsPick);

  return (
    <div className="flex flex-col gap-6 w-full overflow-hidden">
      {/* Compact Layout Preview */}
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 w-full overflow-hidden">
        <h2 className="text-base font-bold flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
          <LayoutTemplate size={16} /> Layout Preview
        </h2>

        {/* Breaking Banner */}
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg mb-3 flex items-center gap-2 min-w-0">
          <div className="font-bold flex items-center gap-1.5 whitespace-nowrap text-sm shrink-0">
            <AlertOctagon size={14} /> Breaking
          </div>
          <div className="truncate text-xs opacity-90 min-w-0">
            {breaking.map(b => b.title).join(" • ") || "No breaking news selected"}
          </div>
        </div>

        {/* Hero + Sidebars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
          {/* Featured Hero */}
          <div className="sm:col-span-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 relative min-w-0">
            <span className="absolute -top-2 -left-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm z-10">
              <Star size={10} /> Featured
            </span>
            {featured.length > 0 ? (
              <div className="mt-3">
                {featured[0].coverImageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={featured[0].coverImageUrl} alt="Cover" className="w-full h-28 object-cover rounded-lg mb-2" />
                ) : (
                  <div className="w-full h-28 bg-slate-100 dark:bg-slate-900 rounded-lg mb-2 flex items-center justify-center text-slate-400 text-xs">No Cover</div>
                )}
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{featured[0].category.name}</span>
                <p className="text-sm font-bold leading-snug mt-1 line-clamp-2">{featured[0].title}</p>
                {featured.length > 1 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold mb-1">ALSO FEATURED</p>
                    <ul className="space-y-1">
                      {featured.slice(1).map(f => (
                        <li key={f.id} className="text-xs font-semibold truncate text-slate-600 dark:text-slate-400">• {f.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-slate-400 text-xs italic mt-3">
                No featured article selected
              </div>
            )}
          </div>

          {/* Right column: Editor's Pick + Trending */}
          <div className="flex flex-col gap-3 min-w-0">
            {/* Editor's Pick */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex-1 relative min-w-0">
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm z-10">
                Editor&apos;s Pick
              </span>
              <div className="mt-3 space-y-2">
                {editorsPick.length > 0 ? editorsPick.map((ep, i) => (
                  <div key={ep.id} className="flex gap-2 items-start pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <span className="text-lg font-black text-slate-200 dark:text-slate-800 leading-none shrink-0">{i + 1}</span>
                    <p className="text-xs font-semibold leading-snug line-clamp-2">{ep.title}</p>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 text-xs italic py-2">Empty</div>
                )}
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex-1 relative min-w-0">
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm z-10">
                <Flame size={10} /> Trending
              </span>
              <div className="mt-3 space-y-2">
                {trending.length > 0 ? trending.map((t) => (
                  <div key={t.id} className="pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold leading-snug line-clamp-2">{t.title}</p>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 text-xs italic py-2">Empty</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 w-full overflow-hidden">
        <h2 className="text-base font-bold mb-3">Select Articles</h2>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search published articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredArticles.map(article => (
            <div
              key={article.id}
              className={`p-3 rounded-xl border transition-colors ${isUpdating === article.id ? 'opacity-50' : ''} ${article.featured || article.breaking || article.trending || article.editorsPick ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}
            >
              <div className="flex gap-2 justify-between mb-2 min-w-0">
                <h3 className="font-semibold text-xs leading-snug line-clamp-2 min-w-0">{article.title}</h3>
                {isUpdating === article.id && <Loader2 size={12} className="animate-spin text-blue-500 shrink-0 mt-0.5" />}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => toggleFlag(article.id, 'featured', article.featured)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${article.featured ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <Star size={10} /> {article.featured ? 'Featured' : 'Feature'}
                </button>
                <button
                  onClick={() => toggleFlag(article.id, 'breaking', article.breaking)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${article.breaking ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <AlertOctagon size={10} /> {article.breaking ? 'Breaking' : 'Break'}
                </button>
                <button
                  onClick={() => toggleFlag(article.id, 'trending', article.trending)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${article.trending ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <Flame size={10} /> {article.trending ? 'Trending' : 'Trend'}
                </button>
                <button
                  onClick={() => toggleFlag(article.id, 'editorsPick', article.editorsPick)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${article.editorsPick ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <CheckCircle2 size={10} /> {article.editorsPick ? 'Picked' : 'Pick'}
                </button>
              </div>
            </div>
          ))}
          {filteredArticles.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-4 col-span-full">No articles found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
