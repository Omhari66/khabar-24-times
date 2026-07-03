import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, optionalTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { ArticleService } from "@/lib/services/article-service";
import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";

const updateArticleSchema = z.object({
  title: optionalTrimmedString(),
  slug: z.string().transform(v => v.trim().toLowerCase()).optional(),
  content: z.any().optional(),
  coverImageUrl: z.string().nullable().optional(),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "REJECTED"]).optional(),
  breaking: z.boolean().optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  editorsPick: z.boolean().optional(),
});

const articleService = new ArticleService(new ArticleRepository());

export const GET = withApiHandler({ scope: "api/articles/[id]:get" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  const role = session.user.role;

  if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
    throw new ForbiddenError("Forbidden");
  }

  const article = await articleService.getArticle(params.id);

  if (role === "REPORTER" && article.authorId !== session.user.id) {
    throw new ForbiddenError("Forbidden: You can only view your own articles");
  }

  return apiSuccess(article);
});

export const PATCH = withApiHandler({ scope: "api/articles/[id]:update" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  const role = session.user.role;

  if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
    throw new ForbiddenError("Forbidden");
  }

  const existingArticle = await articleService.getArticle(params.id);

  const isAuthor = existingArticle.authorId === session.user.id;
  const isEditorOrAdmin = role === "EDITOR" || role === "ADMIN";

  if (!isAuthor && !isEditorOrAdmin) {
    throw new ForbiddenError("Forbidden: You are not the author of this article");
  }

  if (isAuthor && !isEditorOrAdmin) {
    if (existingArticle.status !== "DRAFT" && existingArticle.status !== "REJECTED") {
      throw new ForbiddenError("Forbidden: You can only edit articles in DRAFT or REJECTED status");
    }
  }

  const body = await parseJsonBody(req, updateArticleSchema);
  
  const updateData: Record<string, unknown> = { ...body };
  if (body.status === "PENDING") {
    updateData.rejectionNote = null;
  }

  const updatedArticle = await articleService.updateArticle(params.id, updateData);

  return apiSuccess(updatedArticle);
});

export const DELETE = withApiHandler({ scope: "api/articles/[id]:delete" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  const role = session.user.role;

  if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
    throw new ForbiddenError("Forbidden");
  }

  const article = await articleService.getArticle(params.id);

  if (role === "REPORTER" && article.authorId !== session.user.id) {
    throw new ForbiddenError("Forbidden");
  }

  if (article.status !== "DRAFT") {
    throw new ForbiddenError("Only draft articles can be deleted");
  }

  await articleService.permanentDeleteArticle(params.id);

  return apiSuccess({ success: true });
});
