import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { CalendarRepository } from "@/lib/repositories";
import { CalendarService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Event ID is required"),
});

const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  type: z.string().optional(),
});

const calendarService = new CalendarService(new CalendarRepository());

export const GET = withApiHandler(
  { scope: "api/admin/calendar:item:get" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("calendar.manage");
    const { id: eventId } = parseInput(params, routeParamsSchema);
    const event = await calendarService.getEvent(eventId);
    return apiSuccess(event);
  }
);

export const PATCH = withApiHandler(
  { scope: "api/admin/calendar:item:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("calendar.manage");
    const { id: eventId } = parseInput(params, routeParamsSchema);
    const body = await parseJsonBody(req, updateEventSchema);
    const updated = await calendarService.updateEvent(eventId, body);
    return apiSuccess(updated);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/calendar:item:delete" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("calendar.manage");
    const { id: eventId } = parseInput(params, routeParamsSchema);
    await calendarService.deleteEvent(eventId);
    return apiSuccess({ success: true });
  }
);
