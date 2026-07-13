import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleCard from "../../components/ArticleCard";
import ReaderActions from "../../components/ReaderActions";
import TiptapRenderer, { extractPlainText } from "../../components/TiptapRenderer";
import { ArticleSummaryBox } from "../../components/ArticleSummaryBox";
import ArticleComments from "../../components/ArticleComments";
import CopyProtection from "../../components/CopyProtection";
import { AdBanner } from "../../components/AdBanner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const ARTICLE_INCLUDE = {
  author: { select: { name: true, location: true } },
  category: { select: { name: true, slug: true, id: true } },
} as const;

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

function readingTime(content: unknown) {
  const words = extractPlainText(content, 10000).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: ARTICLE_INCLUDE,
  });

  if (!article) return { title: "Article Not Found" };

  const description = extractPlainText(article.content, 160);
  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      images: article.coverImageUrl ? [article.coverImageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      ...ARTICLE_INCLUDE,
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, image: true } }
        }
      },
      _count: {
        select: { likes: true }
      },
      likes: session?.user?.id ? {
        where: { userId: session.user.id },
        select: { id: true }
      } : false
    },
  });

  if (!article) notFound();

  const relatedArticles = await prisma.article.findMany({
    where: {
      categoryId: article.category.id,
      status: "PUBLISHED",
      NOT: { id: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  // Fetch some "trending" articles for sidebar
  const trendingArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED", NOT: { id: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    }
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": article.coverImageUrl ? [article.coverImageUrl] : [],
    "datePublished": article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date(article.createdAt).toISOString(),
    "dateModified": new Date(article.updatedAt).toISOString(),
    "author": [{
      "@type": "Person",
      "name": article.author?.name ?? "Khabar 24 Times Desk"
    }]
  };

  return (
    <div className="bg-background min-h-screen py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Article Content (8 columns) */}
        <article className="lg:col-span-8 border border-structural bg-white">
          <div className="p-6 md:p-8 border-b border-structural">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-sans text-text-secondary uppercase font-medium mb-4">
              <Link href="/" className="hover:text-primary transition">Home</Link>
              <span>/</span>
              <Link href={`/category/${article.category.slug}`} className="hover:text-primary transition font-bold text-primary">
                {article.category.name}
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-text-primary leading-tight mb-4">
              {article.title}
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary font-sans leading-relaxed mb-6">
              {extractPlainText(article.content, 200)}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-structural">
              <div className="flex flex-col gap-1 text-sm font-sans text-text-secondary">
                <span className="font-bold text-text-primary uppercase tracking-wide">
                  By {article.author?.name ?? "Khabar 24 Times Desk"}
                  {article.author?.location ? ` | ${article.author.location}` : ""}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span>Published: {formatDate(article.publishedAt)}</span>
                  <span>|</span>
                  <span className="flex items-center gap-1"><Clock3 size={14}/> {readingTime(article.content)}</span>
                </div>
              </div>
              <ReaderActions 
                articleId={article.id}
                slug={article.slug} 
                title={article.title} 
                initialLikesCount={article._count?.likes ?? 0}
                initialIsLiked={article.likes && article.likes.length > 0}
              />
            </div>
          </div>

          {article.coverImageUrl && (
            <figure className="w-full border-b border-structural bg-slate-50 flex justify-center">
              <div className="relative w-full max-h-[70vh] flex justify-center overflow-hidden">
                <Image
                  src={article.coverImageUrl}
                  alt={article.coverImageAltText || article.title}
                  width={0}
                  height={0}
                  sizes="100vw"
                  priority
                  style={{ width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain' }}
                  className="bg-slate-100"
                />
              </div>
              {(article.coverImageCaption || article.photographerCredit) && (
                <figcaption className="px-6 md:px-8 py-3 bg-surface-muted text-xs font-sans text-text-secondary border-t border-structural flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="italic">{article.coverImageCaption}</span>
                  {article.photographerCredit && (
                    <span className="font-semibold uppercase tracking-wider whitespace-nowrap">
                      (Photo: {article.photographerCredit})
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          )}

          <div className="p-6 md:p-8">
            <ArticleSummaryBox summary={article.summary} />
            <CopyProtection sourceUrl={`https://www.khabar24times.in/article/${article.slug}`}>
              <div className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:font-sans prose-p:text-text-primary max-w-none [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:bg-black">
                <TiptapRenderer content={article.content} />
              </div>
            </CopyProtection>
          </div>

          {/* Comments Section */}
          <ArticleComments 
            articleId={article.id}
            slug={article.slug}
            comments={article.comments.map(c => ({
              id: c.id,
              content: c.content,
              createdAt: c.createdAt,
              user: {
                name: c.user.name,
                image: c.user.image,
              }
            }))}
          />
        </article>

        {/* Right Sidebar (4 columns) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-surface-muted border border-structural p-5">
            <h3 className="font-condensed font-bold uppercase tracking-wider text-secondary border-b-2 border-secondary pb-2 mb-4">
              Trending Now
            </h3>
            <div className="flex flex-col gap-4">
              {trendingArticles.map((item, index) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-structural last:border-0 last:pb-0">
                  <span className="text-2xl font-serif font-bold text-surface-border">{index + 1}</span>
                  <div>
                    <Link href={`/article/${item.slug}`} className="font-serif font-bold text-text-primary hover:text-primary transition leading-tight">
                      {item.title}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Advertisement */}
          <AdBanner slotName="article-sidebar" />
        </aside>

      </main>

      {/* Related Content (Full width bottom section) */}
      {relatedArticles.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 mt-12">
          <h2 className="font-condensed font-bold uppercase tracking-wider text-text-primary border-t-4 border-primary pt-2 mb-6">
            More in {article.category.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArticles.map(related => (
              <ArticleCard
                key={related.id}
                title={related.title}
                slug={related.slug}
                category={related.category}
                publishedAt={related.publishedAt}
                coverImageUrl={related.coverImageUrl}
                author={related.author}
                content={related.content}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
