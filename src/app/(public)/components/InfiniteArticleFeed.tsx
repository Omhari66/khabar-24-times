"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ArticleCard from "./ArticleCard";
import { fetchFeedArticles } from "../actions";
import { Prisma } from "@prisma/client";

type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: { category: true; author: true };
}>;

interface FeedProps {
  initialArticles: ArticleWithRelations[];
  initialCursor?: string;
}

export function InfiniteArticleFeed({ initialArticles, initialCursor }: FeedProps) {
  const [articles, setArticles] = useState<ArticleWithRelations[]>(initialArticles);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialCursor);

  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!cursor) return;
    setLoading(true);
    try {
      const res = await fetchFeedArticles(cursor);
      setArticles((prev) => [...prev, ...(res.articles as ArticleWithRelations[])]);
      setCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } catch (error) {
      console.error("Failed to fetch more articles", error);
    } finally {
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <h2 className="text-[18px] font-bold text-slate-900">Feed</h2>
      </div>
      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            title={article.title}
            slug={article.slug}
            category={article.category}
            publishedAt={article.publishedAt}
            coverImageUrl={article.coverImageUrl}
            author={article.author}
            content={article.content}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={loaderRef} className="py-8 flex justify-center items-center">
          {loading && (
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      )}
      {!hasMore && articles.length > 0 && (
        <div className="py-8 text-center text-slate-500 font-medium text-sm">
          You have reached the end of the feed.
        </div>
      )}
    </div>
  );
}
