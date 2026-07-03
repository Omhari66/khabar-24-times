import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { NotificationRepository } from "@/lib/repositories";
import { NotificationService } from "@/lib/services";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ForbiddenError } from "@/lib/errors";

const notificationService = new NotificationService(new NotificationRepository());

export const GET = withApiHandler({ scope: "api/admin/notifications:get" }, async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new ForbiddenError("Unauthorized");
  }
  const userId = session.user.id;
  const list = await notificationService.listNotifications(userId);
  return apiSuccess(list);
});

export const POST = withApiHandler({ scope: "api/admin/notifications:readall" }, async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new ForbiddenError("Unauthorized");
  }
  const userId = session.user.id;
  await notificationService.markAllAsRead(userId);
  return apiSuccess({ success: true });
});
