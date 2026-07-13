import { z } from "zod";
import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody, requiredSlugString, requiredTrimmedString } from "@/lib/api/validation";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { ArticleService } from "@/lib/services/article-service";
import { requireSession } from "@/lib/api/auth";
import { requirePermission } from "@/lib/permissions/guard";
import { Prisma } from "@prisma/client";

const createArticleSchema = z.object({
  title: requiredTrimmedString("Title is required"),
  slug: requiredSlugString("Slug is required"),
  content: z.any().optional(),
  coverImageUrl: z.string().nullable().optional(),
  coverImageCaption: z.string().nullable().optional(),
  photographerCredit: z.string().nullable().optional(),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "REJECTED"]).optional(),
  editorBrief: z.any().optional(),
});

const articleService = new ArticleService(new ArticleRepository());

export const GET = withApiHandler({ scope: "api/articles:get" }, async () => {
  const session = await requireSession();
  const role = session.user.role;

  // Ideally, reading the list of articles requires a permission like "article.manage" 
  // or reporters should only see their own.
  // We'll enforce that via code as per the existing logic.
  let whereClause: Prisma.ArticleWhereInput = {};
  
  if (role === "REPORTER") {
    whereClause = { authorId: session.user.id };
  } else if (role !== "EDITOR" && role !== "ADMIN") {
    // Fallback: If not reporter, editor or admin, they shouldn't be here.
    await requirePermission("article.manage"); // Will throw Forbidden since they don't have it
  }

  const articles = await articleService.listArticles(whereClause);
  
  // The service already sorts by default in the repository? No it doesn't. 
  // The old route sorted by createdAt desc.
  // We should sort it here, or modify the repository. 
  // For now we sort in memory to match the old behavior without changing repository interface
  articles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return apiSuccess(articles);
});

export const POST = withApiHandler({ scope: "api/articles:create" }, async (req) => {
  const session = await requireSession();
  
  // Check permission using the correct guard
  await requirePermission("article.create");

  const body = await parseJsonBody(req, createArticleSchema);

  const article = await articleService.createArticle({
    title: body.title,
    slug: body.slug,
    content: body.content,
    coverImageUrl: body.coverImageUrl || null,
    coverImageCaption: body.coverImageCaption || null,
    photographerCredit: body.photographerCredit || null,
    categoryId: body.categoryId,
    status: body.status,
    authorId: session.user.id,
    rejectionNote: null,
  });

  return apiSuccess(article, { status: 201 });
});
