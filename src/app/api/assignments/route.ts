import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";
import { z } from "zod";

const createAssignmentSchema = z.object({
  title: z.string().min(1),
  reporterId: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  deadline: z.string(),
  notes: z.string().optional()
});

export const GET = withApiHandler({ scope: "api/assignments:read" }, async () => {
  const session = await requireSession();
  
  if (session.user.role === "REPORTER") {
    // Reporters only see their own assignments
    const assignments = await prisma.assignment.findMany({
      where: { reporterId: session.user.id },
      orderBy: { deadline: "asc" }
    });
    return apiSuccess(assignments);
  } else {
    // Admins/Editors see all
    const assignments = await prisma.assignment.findMany({
      orderBy: { deadline: "asc" }
    });
    return apiSuccess(assignments);
  }
});

export const POST = withApiHandler({ scope: "api/assignments:create" }, async (req) => {
  const session = await requireSession();
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new ForbiddenError();
  }

  const body = await req.json();
  const data = createAssignmentSchema.parse(body);

  const assignment = await prisma.assignment.create({
    data: {
      title: data.title,
      reporterId: data.reporterId,
      priority: data.priority,
      deadline: new Date(data.deadline),
      notes: data.notes,
      status: "ASSIGNED",
      history: [{ action: "CREATED", date: new Date(), by: session.user.id }]
    }
  });

  return apiSuccess(assignment, { status: 201 });
});
