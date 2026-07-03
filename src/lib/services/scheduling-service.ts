import { ApplicationService } from "./base/application-service";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { NotFoundError } from "@/lib/errors";
import { ArticleStatus } from "@prisma/client";

export class SchedulingService extends ApplicationService {
  constructor(private readonly articleRepository: ArticleRepository) {
    super("service/scheduling");
  }

  async scheduleArticlePublish(id: string, date: Date) {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundError("Article not found");
    }
    return this.articleRepository.update(id, {
      scheduledPublishAt: date,
      status: ArticleStatus.PENDING,
    });
  }

  async processScheduledActions() {
    const now = new Date();

    const toPublish = await this.articleRepository.findAll({
      status: ArticleStatus.PENDING,
      scheduledPublishAt: { lte: now },
    });

    for (const article of toPublish) {
      try {
        await this.articleRepository.update(article.id, {
          status: ArticleStatus.PUBLISHED,
          publishedAt: now,
          scheduledPublishAt: null,
        });
        this.logger.info(`Automatically published scheduled article`, { articleId: article.id });
      } catch (err) {
        this.logger.error(`Failed to publish scheduled article`, { articleId: article.id, error: err });
      }
    }
  }
}
