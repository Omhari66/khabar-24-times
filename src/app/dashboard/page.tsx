import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{ error?: string }>;
}

/**
 * /dashboard — server-side fallback landing page.
 *
 * Reads the session and immediately redirects to the role-appropriate
 * sub-dashboard. The ?error=forbidden param (set by middleware when a user
 * tries to access a route they're not permitted to) is forwarded so the
 * destination page can surface a contextual error banner.
 */
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const { error } = await searchParams;
  const errorSuffix = error === "forbidden" ? "?error=forbidden" : "";

  const role = session.user.role;

  if (role === "REPORTER") {
    redirect(`/dashboard/reporter${errorSuffix}`);
  }

  if (role === "EDITOR") {
    redirect(`/dashboard/editor${errorSuffix}`);
  }

  if (role === "ADMIN") {
    redirect(`/dashboard/admin${errorSuffix}`);
  }

  // Unknown role — send back to login
  redirect("/login");
}
