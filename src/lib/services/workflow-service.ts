import { ApplicationService } from "./base/application-service";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { AuditService } from "./audit-service";
import { NotificationService } from "./notification-service";
import { NotFoundError } from "@/lib/errors";
import { ArticleStatus } from "@prisma/client";
import { socialPostService } from "./social-post-service";

export class WorkflowService extends ApplicationService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService
  ) {
    super("service/workflow");
  }

  async transitionStatus(
    articleId: string,
    targetStatus: ArticleStatus,
    userId: string,
    comments?: string
  ) {
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new NotFoundError("Article not found");
    }

    const previousStatus = article.status;

    const updated = await this.articleRepository.update(articleId, {
      status: targetStatus,
      rejectionNote: comments || null,
    });

    await this.auditService.log({
      action: `WORKFLOW_TRANSITION_${targetStatus}`,
      entityType: "Article",
      entityId: articleId,
      previousValue: { status: previousStatus },
      newValue: { status: targetStatus, comments },
      status: "SUCCESS",
    });

    if (article.authorId) {
      await this.notificationService.sendNotification(
        article.authorId,
        `Your article "${article.title}" has been moved from ${previousStatus} to ${targetStatus}.${
          comments ? ` Note: "${comments}"` : ""
        }`
      );
    }

    // Trigger auto-posting when transitioning to PUBLISHED
    if (targetStatus === ArticleStatus.PUBLISHED && previousStatus !== ArticleStatus.PUBLISHED) {
      socialPostService.autoPost(article.title, article.slug).catch((err) => {
        console.error("[WorkflowService] Failed to auto-post to social networks:", err);
      });
    }

    return updated;
  }
}

