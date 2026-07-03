import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleCard from "../../components/ArticleCard";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} News`,
    description: `Latest news and updates on ${category.name} from Bharat Sentinel.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) notFound();

  const currentPage = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const pageSize = 12;
  const skip = (Math.max(currentPage, 1) - 1) * pageSize;

  const [articles, totalArticles] = await Promise.all([
    prisma.article.findMany({
      where: {
        categoryId: category.id,
        status: "PUBLISHED",
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.article.count({
      where: {
        categoryId: category.id,
        status: "PUBLISHED",
      },
    })
  ]);

  const totalPages = Math.ceil(totalArticles / pageSize);

  return (
    <div className="bg-background min-h-screen py-8">
      <main className="max-w-[1280px] mx-auto px-4">
        {/* Category Header */}
        <div className="border-b-4 border-primary mb-8 pb-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-sans text-text-secondary uppercase font-medium mb-2">
              <Link href="/" className="hover:text-primary transition">Home</Link>
              <span>/</span>
              <span className="font-bold text-text-primary">{category.name}</span>
            </div>
            <h1 className="text-4xl font-serif font-black text-text-primary uppercase tracking-tight">
              {category.name}
            </h1>
          </div>
          <div className="text-sm font-sans font-bold text-text-secondary bg-surface-muted px-4 py-2 border border-structural">
            {totalArticles} Articles
          </div>
        </div>

        {/* Article Grid */}
        <section>
          {articles.length > 0 ? (
            <>
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
              
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-structural">
                  {currentPage > 1 && (
                    <Link href={`/category/${category.slug}?page=${currentPage - 1}`} className="px-4 py-2 border border-structural hover:bg-surface-muted transition font-condensed font-bold uppercase tracking-widest text-sm">
                      Previous
                    </Link>
                  )}
                  <span className="text-sm font-sans text-text-secondary px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link href={`/category/${category.slug}?page=${currentPage + 1}`} className="px-4 py-2 border border-structural hover:bg-surface-muted transition font-condensed font-bold uppercase tracking-widest text-sm">
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface-muted border border-structural flex flex-col items-center py-20 text-center">
              <div className="mb-4 text-surface-border">
                <Layers size={40} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">No Articles Yet</h2>
              <p className="text-sm text-text-secondary font-sans max-w-md">
                We haven&apos;t published any news in this category yet. Please check back later.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
