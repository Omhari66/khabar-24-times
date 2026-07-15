import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserTable from "./components/UserTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN") {
    // Defense-in-depth: Even if middleware fails, prevent access
    redirect("/dashboard?error=forbidden");
  }

  // Fetch all team members (excluding standard users and passwords)
  const teamUsers = await prisma.user.findMany({
    where: {
      role: {
        in: ["REPORTER", "EDITOR", "ADMIN"],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: { articles: true },
      },
    },
    orderBy: {
      email: "asc",
    },
  });

  // Fetch site users (subscribers / Google sign-ins) who can be promoted
  const siteUsers = await prisma.user.findMany({
    where: {
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: { articles: true },
      },
    },
    orderBy: {
      email: "asc",
    },
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your editorial team members and site users.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/admin/users/new"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-md shadow-blue-500/10"
          >
            + Create New User
          </Link>
        </div>
      </div>

      <UserTable
        initialUsers={teamUsers}
        initialSiteUsers={siteUsers}
        currentUserId={session.user.id}
      />
    </div>
  );
}
