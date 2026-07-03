import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KanbanBoard from "./KanbanBoard";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/dashboard?error=forbidden");
  }

  // Fetch all articles
  const articles = await prisma.article.findMany({
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true } }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Content Flow</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kanban view of all articles in the editorial pipeline.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard initialArticles={articles} />
      </div>
    </div>
  );
}
