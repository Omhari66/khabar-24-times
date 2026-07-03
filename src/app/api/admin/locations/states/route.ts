import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredTrimmedString } from "@/lib/api/validation";
import { LocationRepository } from "@/lib/repositories";
import { LocationService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createStateSchema = z.object({
  name: requiredTrimmedString("State name is required"),
  code: z.string().optional(),
  countryId: requiredTrimmedString("Country ID is required"),
});

const locationService = new LocationService(new LocationRepository());

export const GET = withApiHandler({ scope: "api/admin/locations/states:get" }, async (req) => {
  await requirePermission("location.manage");
  const { searchParams } = new URL(req.url);
  const countryId = searchParams.get("countryId") || "";
  const states = await locationService.listStates(countryId);
  return apiSuccess(states);
});

export const POST = withApiHandler({ scope: "api/admin/locations/states:create" }, async (req) => {
  await requirePermission("location.manage");
  const { name, code, countryId } = await parseJsonBody(req, createStateSchema);
  const state = await locationService.createState({ name, code, countryId });
  return apiSuccess(state, { status: 201 });
});
