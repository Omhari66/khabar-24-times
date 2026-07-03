import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredTrimmedString } from "@/lib/api/validation";
import { LocationRepository } from "@/lib/repositories";
import { LocationService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createDistrictSchema = z.object({
  name: requiredTrimmedString("District name is required"),
  stateId: requiredTrimmedString("State ID is required"),
});

const locationService = new LocationService(new LocationRepository());

export const GET = withApiHandler({ scope: "api/admin/locations/districts:get" }, async (req) => {
  await requirePermission("location.manage");
  const { searchParams } = new URL(req.url);
  const stateId = searchParams.get("stateId") || "";
  const districts = await locationService.listDistricts(stateId);
  return apiSuccess(districts);
});

export const POST = withApiHandler({ scope: "api/admin/locations/districts:create" }, async (req) => {
  await requirePermission("location.manage");
  const { name, stateId } = await parseJsonBody(req, createDistrictSchema);
  const district = await locationService.createDistrict({ name, stateId });
  return apiSuccess(district, { status: 201 });
});
