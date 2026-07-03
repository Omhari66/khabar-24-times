import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, parseInput, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories";
import { ArticleService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const routeParamsSchema = z.object({
  id: requiredTrimmedString("Article ID not found"),
});

const updateArticleSchema = z.object({
  title: z.string().optional(),
  slug: requiredSlugString("Slug is required").optional(),
  content: z.any().optional(),
  categoryId: z.string().optional(),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  excerpt: z.string().optional(),
  coverImageUrl: z.string().optional(),
  coverImageCaption: z.string().optional(),
  coverImageAltText: z.string().optional(),
  status: z.any().optional(),
});

const articleService = new ArticleService(new ArticleRepository());

export const GET = withApiHandler(
  { scope: "api/admin/articles:item:get" },
  async (_req, { params }: { params: { id: string } }) => {
    await requirePermission("article.manage");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const article = await articleService.getArticle(articleId);
    return apiSuccess(article);
  }
);

export const PATCH = withApiHandler(
  { scope: "api/admin/articles:item:update" },
  async (req, { params }: { params: { id: string } }) => {
    await requirePermission("article.manage");
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const body = await parseJsonBody(req, updateArticleSchema);
    const updated = await articleService.updateArticle(articleId, body);
    return apiSuccess(updated);
  }
);

export const DELETE = withApiHandler(
  { scope: "api/admin/articles:item:delete" },
  async (req, { params }: { params: { id: string } }) => {
    const { id: articleId } = parseInput(params, routeParamsSchema);
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await requirePermission("article.delete");
      await articleService.permanentDeleteArticle(articleId);
    } else {
      await requirePermission("article.manage");
      await articleService.softDeleteArticle(articleId);
    }

    return apiSuccess({ success: true });
  }
);
