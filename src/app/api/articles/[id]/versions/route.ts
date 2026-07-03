import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { ArticleRepository } from "@/lib/repositories/article-repository";
// Unused import removed
import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";

const articleRepository = new ArticleRepository();

export const GET = withApiHandler({ scope: "api/articles/[id]/versions:get" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  const role = session.user.role;

  if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
    throw new ForbiddenError("Forbidden");
  }

  const versions = await articleRepository.getVersions(params.id);
  return apiSuccess(versions);
});

export const POST = withApiHandler({ scope: "api/articles/[id]/versions:create" }, async (req, { params }: { params: { id: string } }) => {
  const session = await requireSession();
  const role = session.user.role;

  if (role !== "REPORTER" && role !== "EDITOR" && role !== "ADMIN") {
    throw new ForbiddenError("Forbidden");
  }

  const article = await articleRepository.findById(params.id);
  if (!article) {
    throw new ForbiddenError("Article not found");
  }

  // Create new version
  const currentVersion = await articleRepository.getLatestVersionNumber(params.id);
  
  const newVersion = await articleRepository.saveVersion({
    articleId: params.id,
    version: currentVersion + 1,
    title: article.title,
    content: article.content || {},
    authorId: session.user.id,
    revisionNote: "Manual snapshot",
  });

  return apiSuccess(newVersion, { status: 201 });
});
