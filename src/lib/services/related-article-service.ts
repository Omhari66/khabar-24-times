import { ApplicationService } from "./base/application-service";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { NotFoundError } from "@/lib/errors";

export class RelatedArticleService extends ApplicationService {
  constructor(private readonly articleRepository: ArticleRepository) {
    super("service/related-article");
  }

  async getRelatedArticles(articleId: string, limit = 5) {
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new NotFoundError("Article not found");
    }

    const manualRelated = await this.articleRepository.findManualRelated(articleId);
    if (manualRelated.length >= limit) {
      return manualRelated.slice(0, limit);
    }

    const resolved = new Map<string, unknown>();
    manualRelated.forEach((art) => resolved.set(art.id, art));

    const tagIds = await this.articleRepository.getArticleTagIds(articleId);
    if (tagIds.length > 0) {
      const remainingLimit = limit - resolved.size;
      const tagArticleIds = await this.articleRepository.getArticleIdsByTags(tagIds, articleId, remainingLimit);

      for (const id of tagArticleIds) {
        if (resolved.size >= limit) {
          break;
        }
        if (!resolved.has(id)) {
          const art = await this.articleRepository.findById(id);
          if (art) {
            resolved.set(id, art);
          }
        }
      }
    }

    if (resolved.size < limit) {
      const categoryArticles = await this.articleRepository.findAll({
        categoryId: article.categoryId,
        id: { not: articleId },
        status: "PUBLISHED",
      });

      for (const art of categoryArticles) {
        if (resolved.size >= limit) {
          break;
        }
        if (!resolved.has(art.id)) {
          resolved.set(art.id, art);
        }
      }
    }

    return Array.from(resolved.values());
  }

  async addManualRelation(articleId: string, relatedArticleId: string) {
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new NotFoundError("Article not found");
    }

    const related = await this.articleRepository.findById(relatedArticleId);
    if (!related) {
      throw new NotFoundError("Related article not found");
    }

    return this.articleRepository.addManualRelated(articleId, relatedArticleId);
  }

  async removeManualRelation(articleId: string, relatedArticleId: string) {
    return this.articleRepository.removeManualRelated(articleId, relatedArticleId);
  }
}
