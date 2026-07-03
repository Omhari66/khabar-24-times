import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredTrimmedString } from "@/lib/api/validation";
import { ReporterRepository } from "@/lib/repositories";
import { ReporterService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createReporterSchema = z.object({
  userId: requiredTrimmedString("User ID is required"),
  beat: z.string().optional(),
  desk: z.string().optional(),
  status: z.string().optional(),
  contact: z.string().optional(),
  assignmentReady: z.boolean().optional(),
});

const reporterService = new ReporterService(new ReporterRepository());

export const GET = withApiHandler({ scope: "api/admin/reporters:get" }, async () => {
  await requirePermission("reporter.manage");
  const reporters = await reporterService.listReporters();
  return apiSuccess(reporters);
});

export const POST = withApiHandler({ scope: "api/admin/reporters:create" }, async (req) => {
  await requirePermission("reporter.manage");
  const body = await parseJsonBody(req, createReporterSchema);
  const reporter = await reporterService.createReporter(body);
  return apiSuccess(reporter, { status: 201 });
});
