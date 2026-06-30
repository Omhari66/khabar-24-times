import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ArticleCard from "../components/ArticleCard";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Search results for ${q} on NewsPortal.`
      : "Search published stories on NewsPortal.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const hasQuery = query.length > 0;

  const articles = hasQuery
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query.toLowerCase() } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 30,
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="glass-panel-strong rounded-[36px] border border-white/70 p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
          Search desk
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {hasQuery ? "Search results" : "Find a story"}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Search by headline, slug, or section to jump directly into the public archive.
        </p>

        <form action="/search" method="get" role="search" className="mt-6 max-w-2xl">
          <div className="flex flex-col gap-3 rounded-[30px] border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search size={18} className="text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search stories, topics, or sections"
                className="w-full bg-transparent py-2 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {hasQuery && (
        <p className="mt-6 text-sm text-slate-600">
          {articles.length} result{articles.length === 1 ? "" : "s"} for{" "}
          <span className="font-semibold text-slate-950">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      <section className="mt-8">
        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
          <div className="glass-panel-strong flex flex-col items-center rounded-[34px] border border-white/70 px-6 py-20 text-center">
            <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-slate-950 text-white">
              {hasQuery ? <SearchX size={30} /> : <Search size={30} />}
            </div>
            <h2 className="text-2xl font-black text-slate-950">
              {hasQuery ? `No matches for "${query}"` : "Search the newsroom"}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
              {hasQuery
                ? "Try a shorter phrase, a section name, or a different angle."
                : "Use the search bar above to explore published stories."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
