import { ApplicationService } from "./base/application-service";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { Prisma } from "@prisma/client";
import { socialPostService } from "./social-post-service";

export class ArticleService extends ApplicationService {
  constructor(private readonly articleRepository: ArticleRepository) {
    super("service/article");
  }

  async listArticles(whereClause?: Prisma.ArticleWhereInput) {
    return this.articleRepository.findAll(whereClause);
  }

  async getArticle(id: string) {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundError("Article not found");
    }
    return article;
  }

  async getArticleBySlug(slug: string) {
    const article = await this.articleRepository.findBySlug(slug);
    if (!article) {
      throw new NotFoundError("Article not found");
    }
    return article;
  }

  async createArticle(input: Prisma.ArticleUncheckedCreateInput) {
    const existing = await this.articleRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictError("An article with this slug already exists");
    }
    const created = await this.articleRepository.create(input);

    if (created.status === "PUBLISHED") {
      socialPostService.autoPost(created.title, created.slug).catch((err) => {
        console.error("[ArticleService] Failed to auto-post to social networks:", err);
      });
    }

    return created;
  }

  async updateArticle(id: string, input: Prisma.ArticleUncheckedUpdateInput) {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundError("Article not found");
    }

    if (input.slug && typeof input.slug === "string" && input.slug !== article.slug) {
      const existing = await this.articleRepository.findBySlug(input.slug);
      if (existing) {
        throw new ConflictError("An article with this slug already exists");
      }
    }

    const updated = await this.articleRepository.update(id, input);

    if (input.status === "PUBLISHED" && article.status !== "PUBLISHED") {
      socialPostService.autoPost(updated.title, updated.slug).catch((err) => {
        console.error("[ArticleService] Failed to auto-post to social networks:", err);
      });
    }

    return updated;
  }

  async softDeleteArticle(id: string) {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundError("Article not found");
    }
    return this.articleRepository.update(id, { deletedAt: new Date() });
  }

  async restoreArticle(id: string) {
    const article = await this.articleRepository.findById(id, true);
    if (!article) {
      throw new NotFoundError("Article not found");
    }
    return this.articleRepository.update(id, { deletedAt: null });
  }

  async permanentDeleteArticle(id: string) {
    const article = await this.articleRepository.findById(id, true);
    if (!article) {
      throw new NotFoundError("Article not found");
    }
    return this.articleRepository.deletePermanent(id);
  }

  async updateArticleFlags(
    id: string,
    flags: {
      breaking?: boolean;
      featured?: boolean;
      trending?: boolean;
      editorsPick?: boolean;
      liveCoverage?: boolean;
      factCheck?: boolean;
      opinion?: boolean;
      sponsored?: boolean;
      exclusive?: boolean;
      premium?: boolean;
    }
  ) {
    return this.updateArticle(id, flags);
  }
}
