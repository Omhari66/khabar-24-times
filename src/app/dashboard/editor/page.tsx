import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Tag,
  Calendar,
  ChevronRight,
  Inbox,
  BarChart3,
  ShieldOff,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface EditorDashboardProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function EditorDashboard({ searchParams }: EditorDashboardProps) {
  const session = await getServerSession(authOptions);
  const { error } = await searchParams;
  const showForbiddenBanner = error === "forbidden";

  // Defense-in-depth: server-side role check (middleware also enforces this)
  if (!session || !session.user) {
    redirect("/login");
  }
  const role = session.user.role;
  if (role !== "EDITOR" && role !== "ADMIN") {
    redirect("/dashboard?error=forbidden");
  }

  const [pendingArticles, publishedArticles, rejectedArticles] =
    await Promise.all([
      prisma.article.findMany({
        where: { status: "PENDING" },
        include: { author: { select: { name: true } }, category: true },
        orderBy: { createdAt: "asc" }, // oldest first so nothing is forgotten
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        include: { author: { select: { name: true } }, category: true },
        orderBy: { publishedAt: "desc" },
        take: 10,
      }),
      prisma.article.findMany({
        where: { status: "REJECTED" },
        include: { author: { select: { name: true } }, category: true },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

  const formatDate = (d: Date | null, opts?: Intl.DateTimeFormatOptions) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          ...opts,
        })
      : "—";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Forbidden access banner */}
        {showForbiddenBanner && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-amber-800 dark:text-amber-300"
          >
            <ShieldOff size={18} className="shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold text-sm">Access restricted</p>
              <p className="text-sm mt-0.5 text-amber-700 dark:text-amber-400">
                You don&apos;t have access to that page. You&apos;ve been redirected to your dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Editor Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back,{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {session.user.name || session.user.email}
              </span>
              . Review and publish submitted articles.
            </p>
          </div>
          {/* Quick stats */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 rounded-xl">
              <Clock size={16} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {pendingArticles.length} pending
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-xl">
              <BarChart3 size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {publishedArticles.length > 0 ? `${publishedArticles.length} published` : "0 published"}
              </span>
            </div>
          </div>
        </div>

        {/* ── PENDING REVIEW ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-xl">
              <Clock size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Pending Review</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Articles submitted by reporters awaiting your decision
              </p>
            </div>
          </div>

          {pendingArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm max-w-xl">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full mb-4">
                <Inbox size={32} />
              </div>
              <h3 className="text-lg font-bold mb-1">Queue is clear</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No articles are currently pending review. Check back later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingArticles.map((article) => (
                <div
                  key={article.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                        Pending Review
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 px-2 py-0.5 rounded-md">
                        <Tag size={11} />
                        {article.category.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <User size={11} />
                        {article.author.name ?? "Unknown"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={11} />
                        Submitted {formatDate(article.createdAt)}
                      </span>
                    </div>
                    {/* Title */}
                    <h3 className="text-base font-bold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                      {article.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      slug: {article.slug}
                    </p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/dashboard/editor/${article.id}/review`}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm shadow-md shadow-violet-500/10 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    Review
                    <ChevronRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── RECENTLY PUBLISHED ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl">
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Recently Published</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last {publishedArticles.length} published articles
              </p>
            </div>
          </div>

          {publishedArticles.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 pl-1">
              No articles published yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {publishedArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Tag size={11} />
                        {article.category.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <User size={11} />
                        {article.author.name ?? "Unknown"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Calendar size={11} />
                        Published {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold truncate">{article.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                      Published
                    </span>
                    <Link
                      href={`/article/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-colors"
                    >
                      View Live ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── RECENTLY REJECTED ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/40 rounded-xl">
              <XCircle size={20} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Recently Rejected</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last {rejectedArticles.length} rejected articles
              </p>
            </div>
          </div>

          {rejectedArticles.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 pl-1">
              No articles rejected yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {rejectedArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-rose-50 dark:border-rose-900/20 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Tag size={11} />
                          {article.category.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <User size={11} />
                          {article.author.name ?? "Unknown"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={11} />
                          {formatDate(article.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold truncate">{article.title}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 shrink-0">
                      Rejected
                    </span>
                  </div>
                  {article.rejectionNote && (
                    <div className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg px-3 py-2">
                      <span className="font-semibold">Note: </span>
                      {article.rejectionNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
