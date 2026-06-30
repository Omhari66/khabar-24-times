import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleCard from "../../components/ArticleCard";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: "Category not found" };

  return {
    title: `${category.name} section`,
    description: `Published coverage from the ${category.name} desk on NewsPortal.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: {
      categoryId: category.id,
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    take: 24,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="glass-panel-strong rounded-[36px] border border-white/70 p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
          Section
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Category-led discovery for readers who want to follow a subject instead of chasing individual headlines.
        </p>
        <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
          {articles.length} published article{articles.length === 1 ? "" : "s"}
        </div>
      </section>

      <section className="mt-10">
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
              <Layers size={30} />
            </div>
            <h2 className="text-2xl font-black text-slate-950">No published stories yet</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
              This section exists, but no stories have been published to it yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
