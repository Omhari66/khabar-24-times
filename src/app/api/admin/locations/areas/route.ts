import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredTrimmedString } from "@/lib/api/validation";
import { LocationRepository } from "@/lib/repositories";
import { LocationService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createAreaSchema = z.object({
  name: requiredTrimmedString("Area name is required"),
  postalCode: z.string().optional(),
  cityId: requiredTrimmedString("City ID is required"),
});

const locationService = new LocationService(new LocationRepository());

export const GET = withApiHandler({ scope: "api/admin/locations/areas:get" }, async (req) => {
  await requirePermission("location.manage");
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get("cityId") || "";
  const areas = await locationService.listAreas(cityId);
  return apiSuccess(areas);
});

export const POST = withApiHandler({ scope: "api/admin/locations/areas:create" }, async (req) => {
  await requirePermission("location.manage");
  const { name, postalCode, cityId } = await parseJsonBody(req, createAreaSchema);
  const area = await locationService.createArea({ name, postalCode, cityId });
  return apiSuccess(area, { status: 201 });
});
