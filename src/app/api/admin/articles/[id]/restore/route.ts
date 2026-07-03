import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories";
import { ArticleService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Article ID is required"),
});

const articleService = new ArticleService(new ArticleRepository());

export const POST = withApiHandler(
  { scope: "api/admin/articles:restore" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("article.restore");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const restored = await articleService.restoreArticle(articleId);
    return apiSuccess(restored);
  }
);
