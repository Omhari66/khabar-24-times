import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories";
import { RelatedArticleService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Article ID is required"),
});

const relatedArticleSchema = z.object({
  relatedArticleId: requiredTrimmedString("Related Article ID is required"),
});

const relatedArticleService = new RelatedArticleService(new ArticleRepository());

export const GET = withApiHandler(
  { scope: "api/admin/articles:related:list" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("article.manage");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const related = await relatedArticleService.getRelatedArticles(articleId, limit);
    return apiSuccess(related);
  }
);

export const POST = withApiHandler(
  { scope: "api/admin/articles:related:add" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("article.manage");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const { relatedArticleId } = await parseJsonBody(req, relatedArticleSchema);

    const result = await relatedArticleService.addManualRelation(articleId, relatedArticleId);
    return apiSuccess(result);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/articles:related:remove" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("article.manage");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const { relatedArticleId } = await parseJsonBody(req, relatedArticleSchema);

    const result = await relatedArticleService.removeManualRelation(articleId, relatedArticleId);
    return apiSuccess(result);
  }
);
