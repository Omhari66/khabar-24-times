import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { ArticleService } from "@/lib/services/article-service";
import { requirePermission } from "@/lib/permissions/guard";

const rejectSchema = z.object({
  rejectionNote: requiredTrimmedString("Rejection note is required"),
});

const articleService = new ArticleService(new ArticleRepository());

export const POST = withApiHandler({ scope: "api/articles/[id]/reject" }, async (req, { params }: { params: { id: string } }) => {
  await requirePermission("article.publish");

  const { rejectionNote } = await parseJsonBody(req, rejectSchema);

  const updatedArticle = await articleService.updateArticle(params.id, {
    status: "REJECTED",
    rejectionNote,
  });

  return apiSuccess(updatedArticle);
});
