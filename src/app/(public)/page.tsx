import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { extractPlainText } from "./components/TiptapRenderer";
import { TopStoriesGrid } from "./components/TopStoriesGrid";
import { MainFeedLayout } from "./components/MainFeedLayout";
import { getLabelColor } from "@/lib/constants/theme";
import { AdBanner } from "./components/AdBanner";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = {
  title: "Home",
  description: "Khabar 24 Times - Reliable Indian News",
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
  ]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Ticker */}
      {breakingArticles.length > 0 && (
        <section className="bg-red-50 border-b border-red-100">
          <div className="container mx-auto px-4 flex items-center h-10 overflow-hidden">
            <div className="bg-red-600 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider h-full flex items-center z-10 shrink-0">
              BREAKING
            </div>
            <div className="flex-1 overflow-hidden ml-4">
              <div className="ticker-track space-x-8">
                {[...breakingArticles, ...breakingArticles].map((article, i) => (
                  <div key={`${article.id}-${i}`} className="flex items-center space-x-8">
                    <Link href={`/article/${article.slug}`} className="text-[13px] text-red-900 font-medium hover:underline">
                      {article.title}
                    </Link>
                    <span className="text-red-300 select-none text-xs">●</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="py-6 space-y-10">
        
        {/* Top Ad Banner */}
        <div className="container mx-auto px-4">
          <AdBanner slotName="homepage-top-banner" />
        </div>
        
        {/* Top Section */}
        <section className="container mx-auto px-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Hero Story (7 columns) */}
          <div className="xl:col-span-7">
            {featuredArticle ? (
              <article className="group relative bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  {featuredArticle.coverImageUrl && (
                    <Image
                      src={featuredArticle.coverImageUrl}
                      alt={featuredArticle.title}
                      fill
                      priority
                      sizes="(max-width: 1280px) 100vw, 800px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6">
                  <Link href={`/category/${featuredArticle.category.slug}`} className={`font-bold uppercase text-[11px] md:text-[12px] mb-2 block ${getLabelColor(featuredArticle.category.name)}`}>
                    {featuredArticle.category.name}
                  </Link>
                  <h1 className="text-[22px] md:text-[24px] font-medium text-slate-900 leading-tight mb-4">
                    <Link href={`/article/${featuredArticle.slug}`} className="hover:text-blue-600 transition-colors">
                      {featuredArticle.title}
                    </Link>
                  </h1>
                  <p className="text-slate-600 font-sans text-lg mb-6 line-clamp-3">
                    {extractPlainText(featuredArticle.content, 250)}
                  </p>
                  <div className="text-[12px] text-slate-500 font-medium">
                    By <span className="font-bold text-slate-700">{featuredArticle.author?.name ?? "Desk"}</span> | {formatDate(featuredArticle.publishedAt)}
                  </div>
                </div>
              </article>
            ) : (
              <div className="aspect-video bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-medium">
                No featured story available
              </div>
            )}
          </div>

          {/* Top Headlines (5 columns) */}
          <aside className="xl:col-span-5 flex flex-col">
            <h2 className="text-[18px] font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
              Top Stories
            </h2>
            <div className="flex-1 bg-slate-50">
              <TopStoriesGrid articles={topHeadlines} />
            </div>
          </aside>
        </section>

        {/* Main Feed Section */}
        <section className="bg-white border-t border-slate-200">
          <MainFeedLayout />
        </section>
      </main>
    </div>
  );
}
