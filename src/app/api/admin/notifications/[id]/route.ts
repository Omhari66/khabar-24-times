import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { NotificationRepository } from "@/lib/repositories";
import { NotificationService } from "@/lib/services";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Notification ID is required"),
});

const notificationService = new NotificationService(new NotificationRepository());

export const POST = withApiHandler(
  { scope: "api/admin/notifications:read" },
  async (_req, { params }: { params: { id: string } }) => {
    const { id: notificationId } = parseInput(params, routeParamsSchema);
    const updated = await notificationService.markAsRead(notificationId);
    return apiSuccess(updated);
  }
);
