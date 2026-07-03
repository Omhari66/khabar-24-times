import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";

export const PATCH = withApiHandler({ scope: "api/notifications/[id]:update" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  
  const notification = await prisma.cmsNotification.findUnique({ where: { id: params.id } });
  if (!notification || notification.userId !== session.user.id) {
    throw new ForbiddenError();
  }

  const updated = await prisma.cmsNotification.update({
    where: { id: params.id },
    data: { read: true }
  });

  return apiSuccess(updated);
});
