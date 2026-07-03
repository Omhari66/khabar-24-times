import { ApplicationService } from "./base/application-service";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { NotFoundError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export class RevisionService extends ApplicationService {
  constructor(private readonly articleRepository: ArticleRepository) {
    super("service/revision");
  }

  async listRevisions(articleId: string) {
    return this.articleRepository.getVersions(articleId);
  }

  async getRevision(articleId: string, version: number) {
    const rev = await this.articleRepository.getVersion(articleId, version);
    if (!rev) {
      throw new NotFoundError("Revision version not found");
    }
    return rev;
  }

  async createRevision(articleId: string, userId: string, revisionNote?: string) {
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new NotFoundError("Article not found");
    }

    const currentVersion = await this.articleRepository.getLatestVersionNumber(articleId);
    const newVersion = currentVersion + 1;

    return this.articleRepository.saveVersion({
      articleId,
      version: newVersion,
      title: article.title,
      subtitle: article.subtitle,
      summary: article.summary,
      excerpt: article.excerpt,
      content: article.content as Prisma.InputJsonValue,
      revisionNote,
      authorId: userId,
    });
  }

  async restoreRevision(articleId: string, version: number) {
    const rev = await this.getRevision(articleId, version);
    return this.articleRepository.update(articleId, {
      title: rev.title,
      subtitle: rev.subtitle,
      summary: rev.summary,
      excerpt: rev.excerpt,
      content: rev.content as Prisma.InputJsonValue,
    });
  }
}
