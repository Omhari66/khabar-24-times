import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  type: z.string().default("EVENT")
});

export const GET = withApiHandler({ scope: "api/calendar:read" }, async () => {
  await requireSession();
  const events = await prisma.calendarEvent.findMany({
    orderBy: { startDate: "asc" }
  });
  return apiSuccess(events);
});

export const POST = withApiHandler({ scope: "api/calendar:create" }, async (req) => {
  const session = await requireSession();
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new ForbiddenError();
  }

  const body = await req.json();
  const data = createEventSchema.parse(body);

  const event = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      type: data.type
    }
  });

  return apiSuccess(event, { status: 201 });
});
