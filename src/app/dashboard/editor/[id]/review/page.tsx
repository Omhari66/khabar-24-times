import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ArticleForm from "@/app/dashboard/reporter/components/ArticleForm";
import { User, Tag, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "EDITOR" && role !== "ADMIN") {
    redirect("/dashboard?error=forbidden");
  }

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { name: true, email: true } },
        category: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) {
    notFound();
  }

  // Guard: only show the review form for articles currently pending review
  if (article.status !== "PENDING") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto">
            <Clock size={26} />
          </div>
          <h2 className="text-xl font-bold">Not Available for Review</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            This article isn&apos;t currently pending review — it may already be
            published, rejected, or still a draft.
          </p>
          <a
            href="/dashboard/editor"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-colors shadow-md shadow-violet-500/10"
          >
            Back to Editor Dashboard
          </a>
        </div>
      </div>
    );
  }

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-900">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
              <Clock size={11} className="mr-1" />
              Pending Review
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4">
            Review Article
          </h1>

          {/* Article metadata bar */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {article.author.name ?? article.author.email}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag size={14} className="text-slate-400" />
              {article.category.name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              Submitted {formatDate(article.createdAt)}
            </span>
          </div>
        </div>

        {/* ArticleForm in editor mode */}
        <ArticleForm
          initialData={{
            id: article.id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            coverImageUrl: article.coverImageUrl,
            categoryId: article.categoryId,
            status: article.status,
          }}
          categories={categories}
          mode="editor"
        />
      </div>
    </div>
  );
}
