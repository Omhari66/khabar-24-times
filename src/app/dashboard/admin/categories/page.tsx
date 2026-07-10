import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CategoryManagerClient from "./components/CategoryManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN") {
    redirect("/dashboard?error=forbidden");
  }

  // Fetch all categories with their article counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: [
      { parentId: "asc" },
      { name: "asc" },
    ],
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Category Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Create, edit, and organize article categories.
        </p>
      </div>

      <CategoryManagerClient initialCategories={categories} />
    </div>
  );
}
