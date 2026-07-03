import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { CalendarRepository } from "@/lib/repositories";
import { CalendarService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  type: z.string().optional(),
});

const calendarService = new CalendarService(new CalendarRepository());

export const GET = withApiHandler({ scope: "api/admin/calendar:get" }, async (req) => {
  await requirePermission("calendar.manage");
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ? new Date(searchParams.get("start")!) : undefined;
  const end = searchParams.get("end") ? new Date(searchParams.get("end")!) : undefined;

  const events = await calendarService.listEvents(start, end);
  return apiSuccess(events);
});

export const POST = withApiHandler({ scope: "api/admin/calendar:create" }, async (req) => {
  await requirePermission("calendar.manage");
  const body = await parseJsonBody(req, createEventSchema);
  const event = await calendarService.createEvent(body);
  return apiSuccess(event, { status: 201 });
});
