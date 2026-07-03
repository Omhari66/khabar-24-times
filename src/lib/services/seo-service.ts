import { ApplicationService } from "./base/application-service";
import { ArticleRepository } from "@/lib/repositories/article-repository";
import { NotFoundError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export class SEOService extends ApplicationService {
  constructor(private readonly articleRepository: ArticleRepository) {
    super("service/seo");
  }

  async updateArticleSEO(
    id: string,
    seoData: {
      metaTitle?: string | null;
      metaDescription?: string | null;
      canonicalUrl?: string | null;
      ogImageUrl?: string | null;
      twitterImageUrl?: string | null;
      focusKeyword?: string | null;
      schemaOverride?: Prisma.InputJsonValue;
      robotsOverride?: string | null;
    }
  ) {
    const article = await this.articleRepository.findById(id);
    if (!article) {
      throw new NotFoundError("Article not found");
    }

    return this.articleRepository.update(id, seoData);
  }
}
