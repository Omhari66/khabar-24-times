import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ArticleCard from "../components/ArticleCard";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Search results for ${q} on Khabar 24 Times.`
      : "Search Khabar 24 Times's published news.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, sort } = await searchParams;
  const query = (q ?? "").trim();
  const categoryFilter = category ?? "";
  const sortParam = sort ?? "newest";
  const hasQuery = query.length > 0 || categoryFilter.length > 0;

  // Fire and forget metric tracking
  if (query.length > 0) {
    prisma.searchQueryMetric.upsert({
      where: { query },
      update: { count: { increment: 1 }, lastSeen: new Date() },
      create: { query, count: 1 },
    }).catch(console.error);
  }

  const orderBy = sortParam === "oldest" ? { publishedAt: "asc" as const } : { publishedAt: "desc" as const };

  const articles = hasQuery
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          ...(query ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { slug: { contains: query.toLowerCase() } },
              { category: { name: { contains: query, mode: "insensitive" } } },
            ],
          } : {}),
          ...(categoryFilter ? {
            category: { slug: categoryFilter }
          } : {})
        },
        orderBy,
        take: 50,
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
      })
    : [];

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="bg-background min-h-screen py-8">
      <main className="max-w-[1280px] mx-auto px-4">
        
        {/* Search Header */}
        <section className="bg-surface-muted border border-structural p-8 mb-8">
          <h1 className="text-3xl font-serif font-black text-text-primary uppercase tracking-tight mb-4">
            {hasQuery ? "Search Results" : "Search News"}
          </h1>
          <p className="text-text-secondary font-sans text-sm mb-6">
            Search across our entire news archive by keyword, topic, or section.
          </p>

          <form action="/search" method="get" role="search" className="max-w-4xl">
            <div className="flex flex-col md:flex-row gap-4 bg-white border border-structural p-4">
              <div className="flex-1 flex items-center border border-structural px-4">
                <Search size={18} className="text-surface-border mr-3" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Enter keywords..."
                  className="w-full bg-transparent py-3 text-text-primary placeholder:text-text-secondary focus:outline-none font-sans text-base"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <select name="category" defaultValue={categoryFilter} className="border border-structural px-4 py-3 bg-transparent font-sans text-sm focus:outline-none text-text-primary min-w-[150px]">
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <select name="sort" defaultValue={sortParam} className="border border-structural px-4 py-3 bg-transparent font-sans text-sm focus:outline-none text-text-primary min-w-[150px]">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <button
                  type="submit"
                  className="bg-primary text-white font-condensed font-bold tracking-widest uppercase px-8 py-3 hover:bg-primary-dark transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </section>

        {hasQuery && (
          <div className="border-b-4 border-primary mb-8 pb-4 flex justify-between items-end">
            <h2 className="text-xl font-serif font-bold text-text-primary">
              Showing results for {query ? <span>&quot;<span className="text-primary">{query}</span>&quot;</span> : "selected filters"}
            </h2>
            <span className="text-sm font-sans font-bold text-text-secondary bg-surface-muted px-4 py-2 border border-structural">
              {articles.length} Results
            </span>
          </div>
        )}

        <section>
          {articles.length > 0 ? (
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
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
          ) : (
            <div className="border border-structural flex flex-col items-center py-20 text-center bg-white">
              <div className="mb-4 text-surface-border">
                {hasQuery ? <SearchX size={40} /> : <Search size={40} />}
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">
                {hasQuery ? "No results found" : "Enter a search term"}
              </h2>
              <p className="text-sm text-text-secondary font-sans max-w-md">
                {hasQuery
                  ? "Try using different keywords or adjusting your filters."
                  : "Use the search bar above to find the latest news."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
