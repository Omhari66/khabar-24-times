import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";
import { z } from "zod";

const updateAssignmentSchema = z.object({
  status: z.enum(["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
  editorComments: z.string().optional()
});

export const PATCH = withApiHandler({ scope: "api/assignments/[id]:update" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  const body = await req.json();
  const data = updateAssignmentSchema.parse(body);

  const assignment = await prisma.assignment.findUnique({ where: { id: params.id } });
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Reporters can only update status to IN_PROGRESS or SUBMITTED, and can't update editor comments
  if (session.user.role === "REPORTER") {
    if (assignment.reporterId !== session.user.id) {
      throw new ForbiddenError();
    }
    if (data.status && !["IN_PROGRESS", "SUBMITTED"].includes(data.status)) {
      throw new ForbiddenError("Reporters can only transition to IN_PROGRESS or SUBMITTED");
    }
    if (data.editorComments) {
      throw new ForbiddenError("Reporters cannot add editor comments");
    }
  }

  const updated = await prisma.assignment.update({
    where: { id: params.id },
    data: {
      status: data.status,
      notes: data.notes,
      editorComments: data.editorComments,
    }
  });

  return apiSuccess(updated);
});

export const DELETE = withApiHandler({ scope: "api/assignments/[id]:delete" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new ForbiddenError();
  }

  await prisma.assignment.delete({ where: { id: params.id } });
  return apiSuccess({ deleted: true });
});
