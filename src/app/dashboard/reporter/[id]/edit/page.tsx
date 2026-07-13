import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ArticleForm from "@/app/dashboard/reporter/components/ArticleForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
    redirect("/dashboard?error=forbidden");
  }

  const { id } = await params;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) {
    notFound();
  }

  // Reporters can only edit their own articles
  if (role === "REPORTER" && article.authorId !== session.user.id) {
    redirect("/dashboard/reporter");
  }

  // Admins and editors can edit ANY article regardless of status
  // Reporters can only edit DRAFT or REJECTED
  if (role === "REPORTER" && article.status !== "DRAFT" && article.status !== "REJECTED") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold">Article Locked</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            This article is currently <strong>{article.status.toLowerCase()}</strong> and cannot be edited.
            Only articles in Draft or Rejected status can be modified.
          </p>
          <Link
            href="/dashboard/reporter"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-md shadow-blue-500/10"
          >
            <ArrowLeft size={15} />
            Back to My Articles
          </Link>
        </div>
      </div>
    );
  }

  // Determine form mode:
  // - Editors/Admins editing a published article → "admin" mode (save & keep published)
  // - Editors/Admins editing pending/draft → "editor" mode
  // - Reporters → "reporter" mode
  const isEditorOrAdmin = role === "EDITOR" || role === "ADMIN";
  const formMode = isEditorOrAdmin && article.status === "PUBLISHED" ? "admin" : isEditorOrAdmin ? "editor" : "reporter";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <Link
          href="/dashboard/reporter"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to My Articles
        </Link>

        {/* Page header */}
        <div className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              article.status === "REJECTED"
                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                : article.status === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}>
              {article.status === "REJECTED" ? "Revision Required" : article.status === "PUBLISHED" ? "Live — Editing Published Article" : "Draft"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Edit Article
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {article.status === "PUBLISHED"
              ? "You are editing a live article. Changes will be saved and remain published."
              : "Make your changes and save as draft, or submit directly for editor review."}
          </p>
        </div>

        {/* Rejection feedback banner */}
        {article.status === "REJECTED" && article.rejectionNote && (
          <div className="mb-8 flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl text-rose-800 dark:text-rose-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5 text-rose-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <p className="font-semibold text-sm">Editor feedback</p>
              <p className="text-sm mt-0.5 text-rose-700 dark:text-rose-400">{article.rejectionNote}</p>
            </div>
          </div>
        )}

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
          mode={formMode}
          isAdmin={session.user.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
