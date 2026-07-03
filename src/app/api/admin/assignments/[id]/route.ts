import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { AssignmentRepository } from "@/lib/repositories";
import { AssignmentService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Assignment ID is required"),
});

const updateAssignmentSchema = z.object({
  title: z.string().optional(),
  reporterId: z.string().optional(),
  priority: z.string().optional(),
  deadline: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  editorComments: z.string().optional(),
});

const assignmentService = new AssignmentService(new AssignmentRepository());

export const GET = withApiHandler(
  { scope: "api/admin/assignments:item:get" },
  async (_req, { params }: { params: { id: string } }) => {
    const { id: assignmentId } = parseInput(params, routeParamsSchema);
    const assignment = await assignmentService.getAssignment(assignmentId);
    return apiSuccess(assignment);
  }
);

export const PATCH = withApiHandler(
  { scope: "api/admin/assignments:item:update" },
  async (req, { params }: { params: { id: string } }) => {
    const { id: assignmentId } = parseInput(params, routeParamsSchema);
    const body = await parseJsonBody(req, updateAssignmentSchema);

    let updated;
    if (body.status) {
      updated = await assignmentService.updateAssignmentStatus(assignmentId, body.status, body.editorComments);
    } else {
      updated = await assignmentService.updateAssignment(assignmentId, body);
    }

    return apiSuccess(updated);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/assignments:item:delete" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("assignment.manage");
    const { id: assignmentId } = parseInput(params, routeParamsSchema);
    await assignmentService.deleteAssignment(assignmentId);
    return apiSuccess({ success: true });
  }
);
