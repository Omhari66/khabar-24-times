import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredTrimmedString } from "@/lib/api/validation";
import { LocationRepository } from "@/lib/repositories";
import { LocationService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createCitySchema = z.object({
  name: requiredTrimmedString("City name is required"),
  districtId: requiredTrimmedString("District ID is required"),
});

const locationService = new LocationService(new LocationRepository());

export const GET = withApiHandler({ scope: "api/admin/locations/cities:get" }, async (req) => {
  await requirePermission("location.manage");
  const { searchParams } = new URL(req.url);
  const districtId = searchParams.get("districtId") || "";
  const cities = await locationService.listCities(districtId);
  return apiSuccess(cities);
});

export const POST = withApiHandler({ scope: "api/admin/locations/cities:create" }, async (req) => {
  await requirePermission("location.manage");
  const { name, districtId } = await parseJsonBody(req, createCitySchema);
  const city = await locationService.createCity({ name, districtId });
  return apiSuccess(city, { status: 201 });
});
