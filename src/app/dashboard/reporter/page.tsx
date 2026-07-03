import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  Edit2,
  AlertCircle,
  FileText,
  Calendar,
  Tag,
  ChevronRight,
  ShieldOff,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import DeleteDraftButton from "./components/DeleteDraftButton";

export const dynamic = "force-dynamic";

interface ReporterDashboardProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ReporterDashboard({ searchParams }: ReporterDashboardProps) {
  const session = await getServerSession(authOptions);
  const { error } = await searchParams;
  const showForbiddenBanner = error === "forbidden";

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
    redirect("/dashboard?error=forbidden");
  }

  const [articles, assignments] = await Promise.all([
    prisma.article.findMany({
      where: { authorId: session.user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.assignment.findMany({
      where: { reporterId: session.user.id, status: { not: "COMPLETED" } },
      orderBy: { deadline: "asc" },
    })
  ]);

  // Compute stats
  const stats = {
    total: articles.length,
    draft: articles.filter((a) => a.status === "DRAFT").length,
    pending: articles.filter((a) => a.status === "PENDING").length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    rejected: articles.filter((a) => a.status === "REJECTED").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 size={10} />
            Published
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            <Clock size={10} />
            Pending Review
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
            <XCircle size={10} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-400 border border-slate-200 dark:border-slate-800/40">
            <FileText size={10} />
            Draft
          </span>
        );
    }
  };

  const relativeTime = (date: Date) => {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Forbidden access banner */}
        {showForbiddenBanner && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-amber-800 dark:text-amber-300"
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

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-900">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Reporter Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{session.user.name || session.user.email}</span>. Manage and write your news stories.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all"
            >
              View Website ↗
            </Link>
            <Link
              href="/dashboard/reporter/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/10 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} />
              New Article
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Total", value: stats.total, color: "bg-slate-100 dark:bg-slate-900", textColor: "text-slate-700 dark:text-slate-300", icon: BarChart3 },
            { label: "Drafts", value: stats.draft, color: "bg-slate-50 dark:bg-slate-900/60", textColor: "text-slate-600 dark:text-slate-400", icon: FileText },
            { label: "Pending", value: stats.pending, color: "bg-amber-50 dark:bg-amber-950/30", textColor: "text-amber-700 dark:text-amber-400", icon: Clock },
            { label: "Published", value: stats.published, color: "bg-emerald-50 dark:bg-emerald-950/30", textColor: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
            { label: "Rejected", value: stats.rejected, color: "bg-rose-50 dark:bg-rose-950/30", textColor: "text-rose-700 dark:text-rose-400", icon: XCircle },
          ].map(({ label, value, color, textColor, icon: Icon }) => (
            <div key={label} className={`${color} rounded-2xl p-4 border border-slate-100 dark:border-slate-800`}>
              <div className={`flex items-center gap-2 mb-1 ${textColor}`}>
                <Icon size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
              </div>
              <p className={`text-3xl font-extrabold ${textColor}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Assignments Section */}
        {assignments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Active Assignments</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map(assignment => (
                <div key={assignment.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30 shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    assignment.priority === "URGENT" ? "bg-red-500" :
                    assignment.priority === "HIGH" ? "bg-orange-500" :
                    assignment.priority === "MEDIUM" ? "bg-blue-500" : "bg-slate-400"
                  }`} />
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{assignment.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <Clock size={14} />
                    <span>Due {new Date(assignment.deadline).toLocaleDateString()}</span>
                  </div>
                  {assignment.notes && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">{assignment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Articles List Container */}
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm max-w-xl mx-auto mt-10">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold mb-1">No articles found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              You haven&apos;t written any articles yet. Create your first news story now.
            </p>
            <Link
              href="/dashboard/reporter/new"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {articles.map((article) => {
              const isEditable = article.status === "DRAFT" || article.status === "REJECTED";
              const isDraft = article.status === "DRAFT";
              return (
                <div
                  key={article.id}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(article.status)}
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 px-2 py-0.5 rounded-md">
                        <Tag size={12} className="text-slate-400" />
                        {article.category.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={12} />
                        {relativeTime(article.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        slug: {article.slug}
                      </p>
                    </div>

                    {/* Rejection Alert */}
                    {article.status === "REJECTED" && article.rejectionNote && (
                      <div className="mt-3 flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-rose-800 dark:text-rose-300 text-sm">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
                        <div>
                          <span className="font-semibold block mb-0.5">Editor feedback:</span>
                          <p>{article.rejectionNote}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 justify-end">
                    {isDraft && (
                      <DeleteDraftButton articleId={article.id} />
                    )}
                    {isEditable ? (
                      <Link
                        href={`/dashboard/reporter/${article.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-xl font-medium text-sm transition-colors border border-blue-100 dark:border-blue-900/30"
                      >
                        <Edit2 size={14} />
                        Edit Article
                      </Link>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 select-none px-3 py-1.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        {article.status === "PENDING" ? "Under Review" : "Published"}
                      </span>
                    )}
                    <ChevronRight size={18} className="text-slate-350 dark:text-slate-600 hidden md:block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
