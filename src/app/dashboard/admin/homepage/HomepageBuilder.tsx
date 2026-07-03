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
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, [flag]: !currentValue } : a));
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
    <div className="grid lg:grid-cols-[1fr_400px] gap-8 h-full">
      {/* Wireframe Preview */}
      <div className="bg-slate-200 dark:bg-slate-900 rounded-3xl p-6 border border-slate-300 dark:border-slate-800 flex flex-col gap-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <LayoutTemplate size={20} /> Layout Preview
        </h2>

        {/* Breaking Banner */}
        <div className="bg-red-600 text-white p-4 rounded-xl shadow-sm border border-red-700 min-h-[60px] flex items-center">
          <div className="font-bold flex items-center gap-2 whitespace-nowrap mr-4">
            <AlertOctagon size={16} /> Breaking
          </div>
          <div className="truncate text-sm font-medium opacity-90">
            {breaking.map(b => b.title).join(" • ") || "No breaking news selected"}
          </div>
        </div>

        <div className="grid md:grid-cols-[2fr_1fr] gap-6">
          {/* Main Hero (Featured) */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm min-h-[400px] flex flex-col relative">
            <div className="absolute -top-3 -left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
              <Star size={12} /> Featured Hero
            </div>
            {featured.length > 0 ? (
              <div className="flex flex-col h-full mt-4">
                {featured[0].coverImageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={featured[0].coverImageUrl} alt="Cover" className="w-full h-48 object-cover rounded-xl mb-4" />
                ) : (
                  <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4 flex items-center justify-center text-slate-400">No Cover</div>
                )}
                <span className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">{featured[0].category.name}</span>
                <h3 className="text-2xl font-black mb-2 leading-tight">{featured[0].title}</h3>
                {featured.length > 1 && (
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-semibold mb-2">ALSO FEATURED</p>
                    <ul className="space-y-2">
                      {featured.slice(1).map(f => (
                        <li key={f.id} className="text-sm font-bold truncate">• {f.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium italic mt-4">
                No featured articles selected.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* Editor's Pick */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm flex-1 relative">
              <div className="absolute -top-3 -right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                Editor&apos;s Picks
              </div>
              <div className="mt-4 space-y-3">
                {editorsPick.length > 0 ? editorsPick.map((ep, i) => (
                  <div key={ep.id} className="flex gap-3 items-start pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <span className="text-2xl font-black text-slate-200 dark:text-slate-800">{i + 1}</span>
                    <h4 className="text-sm font-bold leading-snug">{ep.title}</h4>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 text-sm italic mt-4">Empty</div>
                )}
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm flex-1 relative">
              <div className="absolute -top-3 -right-3 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                <Flame size={12} /> Trending
              </div>
              <div className="mt-4 space-y-3">
                {trending.length > 0 ? trending.map((t) => (
                  <div key={t.id} className="flex gap-3 items-start pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <h4 className="text-sm font-bold leading-snug">{t.title}</h4>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 text-sm italic mt-4">Empty</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col h-full max-h-[calc(100vh-140px)]">
        <h2 className="text-xl font-bold mb-4">Select Articles</h2>
        <div className="relative mb-4 shrink-0">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search published articles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filteredArticles.map(article => (
            <div key={article.id} className={`p-4 rounded-2xl border transition-colors ${isUpdating === article.id ? 'opacity-50' : ''} ${article.featured || article.breaking || article.trending || article.editorsPick ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}>
              <div className="flex gap-2 justify-between mb-3">
                <h3 className="font-semibold text-sm leading-snug">{article.title}</h3>
                {isUpdating === article.id && <Loader2 size={14} className="animate-spin text-blue-500 shrink-0 mt-0.5" />}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button 
                  onClick={() => toggleFlag(article.id, 'featured', article.featured)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${article.featured ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <Star size={12} /> {article.featured ? 'Featured' : 'Feature'}
                </button>
                <button 
                  onClick={() => toggleFlag(article.id, 'breaking', article.breaking)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${article.breaking ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <AlertOctagon size={12} /> {article.breaking ? 'Breaking' : 'Break'}
                </button>
                <button 
                  onClick={() => toggleFlag(article.id, 'trending', article.trending)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${article.trending ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <Flame size={12} /> {article.trending ? 'Trending' : 'Trend'}
                </button>
                <button 
                  onClick={() => toggleFlag(article.id, 'editorsPick', article.editorsPick)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${article.editorsPick ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
                >
                  <CheckCircle2 size={12} /> {article.editorsPick ? 'Picked' : 'Pick'}
                </button>
              </div>
            </div>
          ))}
          {filteredArticles.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-8">No articles found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
