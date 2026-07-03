import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { AssignmentRepository } from "@/lib/repositories";
import { AssignmentService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  reporterId: z.string().min(1, "Reporter ID is required"),
  priority: z.string().optional(),
  deadline: z.string().transform((val) => new Date(val)),
  notes: z.string().optional(),
});

const assignmentService = new AssignmentService(new AssignmentRepository());

export const GET = withApiHandler({ scope: "api/admin/assignments:get" }, async (req) => {
  const { searchParams } = new URL(req.url);
  const reporterId = searchParams.get("reporterId");

  if (reporterId) {
    const list = await assignmentService.listAssignmentsByReporter(reporterId);
    return apiSuccess(list);
  }

  await requirePermission("assignment.manage");
  const assignments = await assignmentService.listAssignments();
  return apiSuccess(assignments);
});

export const POST = withApiHandler({ scope: "api/admin/assignments:create" }, async (req) => {
  await requirePermission("assignment.manage");
  const body = await parseJsonBody(req, createAssignmentSchema);
  const assignment = await assignmentService.createAssignment(body);
  return apiSuccess(assignment, { status: 201 });
});
