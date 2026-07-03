import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { ReporterRepository } from "@/lib/repositories";
import { ReporterService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Reporter ID not found"),
});

const updateReporterSchema = z
  .object({
    beat: z.string().optional(),
    desk: z.string().optional(),
    status: z.string().optional(),
    contact: z.string().optional(),
    assignmentReady: z.boolean().optional(),
  })
  .refine(
    (val) =>
      val.beat !== undefined ||
      val.desk !== undefined ||
      val.status !== undefined ||
      val.contact !== undefined ||
      val.assignmentReady !== undefined,
    { message: "No fields provided for update" }
  );

const reporterService = new ReporterService(new ReporterRepository());

export const GET = withApiHandler(
  { scope: "api/admin/reporters:item:get" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("reporter.manage");
    const { id: reporterId } = parseInput(params, routeParamsSchema);
    const reporter = await reporterService.getReporter(reporterId);
    return apiSuccess(reporter);
  }
);

export const PATCH = withApiHandler(
  { scope: "api/admin/reporters:item:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("reporter.manage");
    const { id: reporterId } = parseInput(params, routeParamsSchema);
    const body = await parseJsonBody(req, updateReporterSchema);
    const updated = await reporterService.updateReporter(reporterId, body);
    return apiSuccess(updated);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/reporters:item:delete" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("reporter.manage");
    const { id: reporterId } = parseInput(params, routeParamsSchema);
    const result = await reporterService.deleteReporter(reporterId);
    return apiSuccess(result);
  }
);
