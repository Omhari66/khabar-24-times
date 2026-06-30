import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock3,
  Flame,
  Layers3,
  Newspaper,
  Radar,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import ArticleCard from "./components/ArticleCard";
import { extractPlainText } from "./components/TiptapRenderer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Homepage",
  description:
    "Stay informed with the latest reporting, analysis, and category-led discovery from NewsPortal.",
};

const ARTICLE_INCLUDE = {
  author: { select: { name: true } },
  category: { select: { name: true, slug: true } },
} as const;

function formatDate(date: Date | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function readingTime(content: unknown) {
  const words = extractPlainText(content, 10_000).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

export default async function HomePage() {
  const [featuredArticle, latestArticles, categories, publishedCount] =
    await Promise.all([
      prisma.article.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: ARTICLE_INCLUDE,
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 8,
        include: ARTICLE_INCLUDE,
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
        take: 6,
      }),
      prisma.article.count({
        where: { status: "PUBLISHED" },
      }),
    ]);

  const supportingArticles = latestArticles.slice(1, 4);
  const gridArticles = latestArticles.slice(4);
  const tickerArticles = latestArticles.slice(0, 6);

  return (
    <div className="pb-10">
      {tickerArticles.length > 0 && (
        <section className="border-b border-white/60 bg-slate-950 text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <Flame size={14} className="text-amber-300" />
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-200">
                Breaking
              </span>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="ticker-track inline-flex gap-10 whitespace-nowrap">
                {[...tickerArticles, ...tickerArticles].map((article, index) => (
                  <Link
                    key={`${article.id}-${index}`}
                    href={`/article/${article.slug}`}
                    className="text-sm text-slate-300 transition hover:text-white"
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grain-overlay relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            {featuredArticle ? (
              <article className="relative overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
                <div className="absolute inset-0">
                  {featuredArticle.coverImageUrl ? (
                    <Image
                      src={featuredArticle.coverImageUrl}
                      alt={featuredArticle.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      className="object-cover opacity-45"
                    />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.35),_transparent_35%),linear-gradient(140deg,_#0f172a,_#134e4a,_#1f2937)]" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="relative flex min-h-[540px] flex-col justify-end p-7 sm:p-10">
                  <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-white/12 px-3 py-1 font-semibold backdrop-blur">
                      Lead Story
                    </span>
                    <Link
                      href={`/category/${featuredArticle.category.slug}`}
                      className="rounded-full bg-emerald-400/20 px-3 py-1 font-semibold text-emerald-100 transition hover:bg-emerald-400/30"
                    >
                      {featuredArticle.category.name}
                    </Link>
                  </div>
                  <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
                    <Link href={`/article/${featuredArticle.slug}`} className="transition hover:text-emerald-200">
                      {featuredArticle.title}
                    </Link>
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                    {extractPlainText(featuredArticle.content, 220)}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-slate-200">
                    <span>{featuredArticle.author.name ?? "NewsPortal Desk"}</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatDate(featuredArticle.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {readingTime(featuredArticle.content)}
                    </span>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/article/${featuredArticle.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-50"
                    >
                      Read full report
                      <ArrowRight size={15} />
                    </Link>
                    <Link
                      href={`/category/${featuredArticle.category.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Explore section
                    </Link>
                  </div>
                </div>
              </article>
            ) : (
              <div className="glass-panel-strong flex min-h-[420px] flex-col items-center justify-center rounded-[32px] border border-white/70 p-10 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-white">
                  <Newspaper size={30} />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-950">
                  NewsPortal is ready.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                  Publish the first article to activate the public newsroom, category discovery, search, and editorial flow.
                </p>
              </div>
            )}

            <aside className="space-y-6">
              <div className="glass-panel-strong rounded-[32px] border border-white/70 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                    <Radar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      Live Snapshot
                    </p>
                    <h2 className="text-xl font-black text-slate-950">
                      Today&apos;s signal
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Published stories" value={String(publishedCount)} />
                  <Metric label="Active sections" value={String(categories.length)} />
                </div>
              </div>

              <div className="glass-panel rounded-[32px] border border-white/70 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Sparkles size={16} />
                  </div>
                  <h2 className="text-lg font-black text-slate-950">Fast reads</h2>
                </div>
                <div className="space-y-4">
                  {supportingArticles.length > 0 ? (
                    supportingArticles.map((article, index) => (
                      <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group block rounded-3xl border border-white/70 bg-white/70 p-4 transition hover:border-slate-200 hover:bg-white"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            0{index + 1}
                          </span>
                          <span className="text-xs font-medium text-emerald-700">
                            {article.category.name}
                          </span>
                        </div>
                        <h3 className="font-bold leading-6 text-slate-900 transition group-hover:text-emerald-800">
                          {article.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {extractPlainText(article.content, 100)}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No supporting stories yet.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>

          {categories.length > 0 && (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="glass-panel flex items-center justify-between rounded-[28px] border border-white/70 px-5 py-4 transition hover:-translate-y-0.5 hover:bg-white/95"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {category._count.articles} article{category._count.articles === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Layers3 size={18} className="text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
              Fresh coverage
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Latest reports
            </h2>
          </div>
          <Link href="/search" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
            Search all stories
          </Link>
        </div>

        {gridArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {gridArticles.map((article) => (
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
          <div className="glass-panel-strong rounded-[32px] border border-white/70 p-8 text-sm text-slate-600">
            Publish more stories to populate the latest reports grid.
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/75 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
