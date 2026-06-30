import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock3, Tag, User } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleCard from "../../components/ArticleCard";
import ReaderActions from "../../components/ReaderActions";
import TiptapRenderer, { extractPlainText } from "../../components/TiptapRenderer";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const ARTICLE_INCLUDE = {
  author: { select: { name: true } },
  category: { select: { name: true, slug: true, id: true } },
} as const;

function formatDate(date: Date | null) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function readingTime(content: unknown) {
  const words = extractPlainText(content, 10_000).split(/\s+/).filter(Boolean).length;
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

  if (!article) {
    return { title: "Article not found" };
  }

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

  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: ARTICLE_INCLUDE,
  });

  if (!article) notFound();

  const relatedArticles = await prisma.article.findMany({
    where: {
      categoryId: article.category.id,
      status: "PUBLISHED",
      NOT: { id: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="pb-12">
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="mb-6">
          <Link
            href={`/category/${article.category.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={15} />
            Back to {article.category.name}
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href={`/category/${article.category.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-900 transition hover:bg-emerald-200"
              >
                <Tag size={13} />
                {article.category.name}
              </Link>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600">
                {readingTime(article.content)}
              </span>
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              {article.title}
            </h1>

            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              {extractPlainText(article.content, 220)}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="flex items-center gap-2 font-semibold text-slate-800">
                <User size={14} />
                {article.author.name ?? "NewsPortal Desk"}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 size={14} />
                Published story
              </span>
            </div>

            <ReaderActions slug={article.slug} title={article.title} />
          </div>

          <div className="glass-panel overflow-hidden rounded-[32px] border border-white/70 p-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-slate-200">
              {article.coverImageUrl ? (
                <Image
                  src={article.coverImageUrl}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(145deg,_#0f766e,_#0f172a)]" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
        <div className="glass-panel-strong rounded-[34px] border border-white/70 px-6 py-8 sm:px-10 sm:py-10">
          <TiptapRenderer content={article.content} />
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
              More coverage
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Continue in {article.category.name}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard
                key={relatedArticle.id}
                title={relatedArticle.title}
                slug={relatedArticle.slug}
                category={relatedArticle.category}
                publishedAt={relatedArticle.publishedAt}
                coverImageUrl={relatedArticle.coverImageUrl}
                author={relatedArticle.author}
                content={relatedArticle.content}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
