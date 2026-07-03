import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { ArticleRepository, AuditRepository, NotificationRepository } from "@/lib/repositories";
import { WorkflowService, AuditService, NotificationService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";
import { ArticleStatus } from "@prisma/client";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ForbiddenError } from "@/lib/errors";

const transitionSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  targetStatus: z.nativeEnum(ArticleStatus),
  comments: z.string().optional(),
});

const workflowService = new WorkflowService(
  new ArticleRepository(),
  new AuditService(new AuditRepository()),
  new NotificationService(new NotificationRepository())
);

export const POST = withApiHandler({ scope: "api/admin/workflow:transition" }, async (req) => {
  await requirePermission("workflow.manage");
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new ForbiddenError("Unauthorized");
  }
  const userId = session.user.id;
  const { articleId, targetStatus, comments } = await parseJsonBody(req, transitionSchema);

  const updated = await workflowService.transitionStatus(articleId, targetStatus, userId, comments);
  return apiSuccess(updated);
});
