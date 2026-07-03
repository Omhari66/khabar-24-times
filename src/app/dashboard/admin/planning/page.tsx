import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PlanningBoard from "./PlanningBoard";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/dashboard?error=forbidden");
  }

  const [assignments, events, reporters] = await Promise.all([
    prisma.assignment.findMany({ orderBy: { deadline: "asc" } }),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
    prisma.user.findMany({ where: { role: "REPORTER" }, select: { id: true, name: true, email: true } })
  ]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Planning & Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage editorial assignments and track upcoming events.
          </p>
        </div>
      </div>

      <PlanningBoard 
        initialAssignments={assignments} 
        initialEvents={events} 
        reporters={reporters}
      />
    </div>
  );
}
