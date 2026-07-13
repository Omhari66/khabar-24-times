import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ArticleForm from "../components/ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
    redirect("/dashboard?error=forbidden");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Create New Article</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Draft a new story and submit it for editing review.
        </p>
      </div>
      <ArticleForm categories={categories} isAdmin={session.user.role === "ADMIN"} />
    </div>
  );
}
