import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HomepageBuilder from "./HomepageBuilder";

export const dynamic = "force-dynamic";

export default async function HomepageBuilderPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/dashboard?error=forbidden");
  }

  // Fetch only published articles that could be on the homepage, or recent ones
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } }
    },
    orderBy: { publishedAt: "desc" },
    take: 50
  });

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Homepage Builder</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Curate the front page by pinning articles to specific layout slots.
          </p>
        </div>
      </div>

      <HomepageBuilder initialArticles={articles} />
    </div>
  );
}
