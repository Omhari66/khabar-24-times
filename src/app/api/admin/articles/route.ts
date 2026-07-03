import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories";
import { ArticleService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const createArticleSchema = z.object({
  title: requiredTrimmedString("Title is required"),
  slug: requiredSlugString("Slug is required"),
  content: z.any(),
  categoryId: requiredTrimmedString("Category ID is required"),
  authorId: requiredTrimmedString("Author ID is required"),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  excerpt: z.string().optional(),
});

const articleService = new ArticleService(new ArticleRepository());

export const GET = withApiHandler({ scope: "api/admin/articles:get" }, async () => {
  await requirePermission("article.manage");
  const articles = await articleService.listArticles();
  return apiSuccess(articles);
});

export const POST = withApiHandler({ scope: "api/admin/articles:create" }, async (req) => {
  await requirePermission("article.create");
  const body = await parseJsonBody(req, createArticleSchema);
  const article = await articleService.createArticle(body);
  return apiSuccess(article, { status: 201 });
});
