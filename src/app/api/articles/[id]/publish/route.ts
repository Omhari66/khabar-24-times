import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { ArticleService } from "@/lib/services/article-service";
import { requirePermission } from "@/lib/permissions/guard";

const articleService = new ArticleService(new ArticleRepository());

export const POST = withApiHandler({ scope: "api/articles/[id]/publish" }, async (req, { params }: { params: { id: string } }) => {
  await requirePermission("article.publish");

  const updatedArticle = await articleService.updateArticle(params.id, {
    status: "PUBLISHED",
    publishedAt: new Date(),
  });

  return apiSuccess(updatedArticle);
});
