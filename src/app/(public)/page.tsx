import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleCard from "./components/ArticleCard";
import { extractPlainText } from "./components/TiptapRenderer";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = {
  title: "Home",
  description: "Bharat Sentinel - Reliable Indian News",
};

const ARTICLE_INCLUDE = {
  author: { select: { name: true } },
  category: { select: { name: true, slug: true } },
} as const;

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [
    featuredArticle,
    breakingArticles,
    topHeadlines,
    politics,
    business,
    localNews,
  ] = await Promise.all([
    // Hero Story (Featured)
    prisma.article.findFirst({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { publishedAt: "desc" },
      include: ARTICLE_INCLUDE,
    }),
    // Breaking News
    prisma.article.findMany({
      where: { status: "PUBLISHED", breaking: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    // Trending / Editor's Pick as Top Headlines
    prisma.article.findMany({
      where: { status: "PUBLISHED", OR: [{ trending: true }, { editorsPick: true }] },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: ARTICLE_INCLUDE,
    }),
    // Politics
    prisma.article.findMany({
      where: { status: "PUBLISHED", category: { slug: "politics" } },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: ARTICLE_INCLUDE,
    }),
    // Business
    prisma.article.findMany({
      where: { status: "PUBLISHED", category: { slug: "business" } },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: ARTICLE_INCLUDE,
    }),
    // Local-first experience simulation (Priority: local locations)
    // For now we'll fetch general articles and pretend it's a local feed
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 4,
      skip: 7,
      include: ARTICLE_INCLUDE,
    }),
  ]);

  return (
    <div className="bg-background min-h-screen">
      {/* Ticker */}
      {breakingArticles.length > 0 && (
        <section className="bg-primary text-white border-b-4 border-primary-dark">
          <div className="max-w-[1280px] mx-auto px-4 flex items-center h-10 overflow-hidden">
            <div className="bg-primary-dark px-3 py-1 text-xs font-bold uppercase tracking-wider h-full flex items-center z-10 shrink-0">
              BREAKING
            </div>
            <div className="flex-1 overflow-hidden ml-4">
              <div className="ticker-track space-x-8">
                {[...breakingArticles, ...breakingArticles].map((article, i) => (
                  <Link key={`${article.id}-${i}`} href={`/article/${article.slug}`} className="text-sm font-medium hover:underline">
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <main className="max-w-[1280px] mx-auto px-4 py-6 space-y-10">
        
        {/* Top Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Hero Story (8 columns) */}
          <div className="lg:col-span-8">
            {featuredArticle ? (
              <article className="group relative border border-structural bg-white">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-muted">
                  {featuredArticle.coverImageUrl && (
                    <Image
                      src={featuredArticle.coverImageUrl}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6">
                  <Link href={`/category/${featuredArticle.category.slug}`} className="text-primary font-condensed font-bold uppercase tracking-widest text-xs mb-2 block">
                    {featuredArticle.category.name}
                  </Link>
                  <h1 className="text-4xl font-serif font-bold text-text-primary leading-tight mb-3">
                    <Link href={`/article/${featuredArticle.slug}`} className="hover:text-primary transition">
                      {featuredArticle.title}
                    </Link>
                  </h1>
                  <p className="text-text-secondary font-sans text-lg mb-4">
                    {extractPlainText(featuredArticle.content, 200)}
                  </p>
                  <div className="text-xs text-text-secondary font-sans font-medium uppercase">
                    By {featuredArticle.author.name ?? "Desk"} | {formatDate(featuredArticle.publishedAt)}
                  </div>
                </div>
              </article>
            ) : (
              <div className="h-64 bg-surface-muted border border-structural flex items-center justify-center text-text-secondary">
                No featured story available
              </div>
            )}
          </div>

          {/* Top Headlines (4 columns) */}
          <aside className="lg:col-span-4 border border-structural bg-surface-muted p-5">
            <h2 className="font-condensed font-bold uppercase tracking-wider text-secondary border-b-2 border-secondary pb-2 mb-4">
              Trending & Editor's Picks
            </h2>
            <div className="flex flex-col gap-4">
              {topHeadlines.length > 0 ? topHeadlines.map((article, index) => (
                <div key={article.id} className="flex gap-3 pb-4 border-b border-structural last:border-0 last:pb-0">
                  <span className="text-2xl font-serif font-bold text-surface-border">{index + 1}</span>
                  <div>
                    <Link href={`/article/${article.slug}`} className="font-serif font-bold text-text-primary hover:text-primary transition leading-tight">
                      {article.title}
                    </Link>
                    <div className="text-xs text-text-secondary mt-1">
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-text-secondary">No trending articles right now.</div>
              )}
            </div>
          </aside>
        </section>

        <hr className="border-structural" />

        {/* Categories Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Politics */}
          <div>
            <h2 className="font-condensed font-bold uppercase tracking-wider text-text-primary border-t-4 border-primary pt-2 mb-4">
              Politics
            </h2>
            <div className="flex flex-col gap-5">
              {politics.map(article => (
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
          </div>

          {/* Business */}
          <div>
            <h2 className="font-condensed font-bold uppercase tracking-wider text-text-primary border-t-4 border-primary pt-2 mb-4">
              Business
            </h2>
            <div className="flex flex-col gap-5">
              {business.map(article => (
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
          </div>

          {/* Local News */}
          <div>
            <h2 className="font-condensed font-bold uppercase tracking-wider text-text-primary border-t-4 border-primary pt-2 mb-4">
              Local News
            </h2>
            <div className="flex flex-col gap-5">
              {localNews.map(article => (
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
          </div>
        </section>
      </main>
    </div>
  );
}
