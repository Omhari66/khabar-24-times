import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api/auth";

export const GET = withApiHandler({ scope: "api/notifications:read" }, async () => {
  const session = await requireSession();
  
  const notifications = await prisma.cmsNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return apiSuccess(notifications);
});
