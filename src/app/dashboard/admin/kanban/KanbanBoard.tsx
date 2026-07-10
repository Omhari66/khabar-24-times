"use client";

import React, { useState } from "react";
import { User, Tag, Calendar, Clock, CheckCircle2, XCircle, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArticleStatus } from "@prisma/client";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  updatedAt: Date;
  author: { name: string | null; email: string };
  category: { name: string };
}

export default function KanbanBoard({ initialArticles }: { initialArticles: (Omit<Article, "updatedAt"> & { updatedAt: string | Date })[] }) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>(
    initialArticles.map((a) => ({
      ...a,
      updatedAt: new Date(a.updatedAt)
    }))
  );
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const columns: { id: ArticleStatus; title: string; icon: React.ReactNode; color: string }[] = [
    { id: "DRAFT", title: "Drafts", icon: <FileText size={16} />, color: "bg-slate-100 border-slate-200 text-slate-800" },
    { id: "PENDING", title: "Pending Review", icon: <Clock size={16} />, color: "bg-amber-100 border-amber-200 text-amber-800" },
    { id: "PUBLISHED", title: "Published", icon: <CheckCircle2 size={16} />, color: "bg-emerald-100 border-emerald-200 text-emerald-800" },
    { id: "REJECTED", title: "Rejected", icon: <XCircle size={16} />, color: "bg-rose-100 border-rose-200 text-rose-800" }
  ];

  const updateArticleStatus = async (id: string, newStatus: ArticleStatus) => {
    setIsUpdating(id);
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setArticles(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    } finally {
      setIsUpdating(null);
    }
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.currentTarget.classList.add("opacity-50");
  };

  const onDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, columnId: ArticleStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const article = articles.find(a => a.id === id);
    if (article && article.status !== columnId) {
      updateArticleStatus(id, columnId);
    }
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      {columns.map(col => (
        <div 
          key={col.id}
          className="flex-shrink-0 w-80 flex flex-col bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, col.id)}
        >
          <div className={`flex items-center gap-2 p-4 border-b rounded-t-2xl font-bold ${col.color}`}>
            {col.icon}
            {col.title}
            <span className="ml-auto bg-white/50 px-2 py-0.5 rounded-full text-xs">
              {articles.filter(a => a.status === col.id).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {articles.filter(a => a.status === col.id).map(article => (
              <div 
                key={article.id}
                draggable
                onDragStart={(e) => onDragStart(e, article.id)}
                onDragEnd={onDragEnd}
                className={`bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors ${isUpdating === article.id ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {article.title}
                  </h3>
                  {isUpdating === article.id && <Loader2 size={14} className="animate-spin text-blue-500 shrink-0" />}
                </div>
                
                <div className="space-y-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    <span className="truncate">{article.author.name || article.author.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag size={12} />
                      <span className="truncate max-w-[100px]">{article.category.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <Link 
                    href={`/dashboard/editor/${article.id}/review`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
