import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredTrimmedString } from "@/lib/api/validation";
import { LocationRepository } from "@/lib/repositories";
import { LocationService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createCountrySchema = z.object({
  name: requiredTrimmedString("Country name is required"),
  code: requiredTrimmedString("Country code is required").transform((val) => val.toUpperCase()),
});

const locationService = new LocationService(new LocationRepository());

export const GET = withApiHandler({ scope: "api/admin/locations/countries:get" }, async () => {
  await requirePermission("location.manage");
  const countries = await locationService.listCountries();
  return apiSuccess(countries);
});

export const POST = withApiHandler({ scope: "api/admin/locations/countries:create" }, async (req) => {
  await requirePermission("location.manage");
  const { name, code } = await parseJsonBody(req, createCountrySchema);
  const country = await locationService.createCountry({ name, code });
  return apiSuccess(country, { status: 201 });
});
