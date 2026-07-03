import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";

export const DELETE = withApiHandler({ scope: "api/calendar/[id]:delete" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
    throw new ForbiddenError();
  }

  await prisma.calendarEvent.delete({ where: { id: params.id } });
  return apiSuccess({ deleted: true });
});
