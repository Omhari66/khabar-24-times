import { PrismaRepository } from "./base/prisma-repository";
import { Prisma } from "@prisma/client";

export class ArticleRepository extends PrismaRepository {
  async findAll(whereClause?: Prisma.ArticleWhereInput) {
    return this.prisma.article.findMany({
      where: {
        deletedAt: null,
        ...whereClause,
      },
      include: {
        category: true,
        author: true,
      },
    });
  }

  async findById(id: string, includeDeleted = false) {
    return this.prisma.article.findUnique({
      where: includeDeleted
        ? { id }
        : { id, deletedAt: null },
      include: {
        category: true,
        author: true,
      },
    });
  }

  async findBySlug(slug: string, includeDeleted = false) {
    return this.prisma.article.findUnique({
      where: includeDeleted
        ? { slug }
        : { slug, deletedAt: null },
      include: {
        category: true,
        author: true,
      },
    });
  }

  async create(data: Prisma.ArticleUncheckedCreateInput) {
    return this.prisma.article.create({ data });
  }

  async update(id: string, data: Prisma.ArticleUncheckedUpdateInput) {
    return this.prisma.article.update({
      where: { id },
      data,
    });
  }

  async deletePermanent(id: string) {
    return this.prisma.article.delete({ where: { id } });
  }

  // Revision History
  async saveVersion(data: {
    articleId: string;
    version: number;
    title: string;
    subtitle?: string | null;
    summary?: string | null;
    excerpt?: string | null;
    content: Prisma.InputJsonValue;
    revisionNote?: string | null;
    authorId: string;
  }) {
    return this.prisma.articleVersion.create({ data });
  }

  async getLatestVersionNumber(articleId: string): Promise<number> {
    const agg = await this.prisma.articleVersion.aggregate({
      where: { articleId },
      _max: { version: true },
    });
    return agg._max.version || 0;
  }

  async getVersions(articleId: string) {
    return this.prisma.articleVersion.findMany({
      where: { articleId },
      orderBy: { version: "desc" },
    });
  }

  async getVersion(articleId: string, version: number) {
    return this.prisma.articleVersion.findUnique({
      where: {
        articleId_version: {
          articleId,
          version,
        },
      },
    });
  }

  // Related Content
  async findManualRelated(articleId: string) {
    const links = await this.prisma.relatedArticle.findMany({
      where: { articleId },
    });
    const ids = links.map((l) => l.relatedArticleId);
    return this.prisma.article.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
    });
  }

  async addManualRelated(articleId: string, relatedArticleId: string) {
    return this.prisma.relatedArticle.upsert({
      where: {
        articleId_relatedArticleId: {
          articleId,
          relatedArticleId,
        },
      },
      update: {},
      create: {
        articleId,
        relatedArticleId,
      },
    });
  }

  async removeManualRelated(articleId: string, relatedArticleId: string) {
    return this.prisma.relatedArticle.delete({
      where: {
        articleId_relatedArticleId: {
          articleId,
          relatedArticleId,
        },
      },
    });
  }

  async getArticleTagIds(articleId: string): Promise<string[]> {
    const links = await this.prisma.articleTag.findMany({
      where: { articleId },
    });
    return links.map((l) => l.tagId);
  }

  async getArticleIdsByTags(tagIds: string[], excludeId: string, limit = 5): Promise<string[]> {
    const links = await this.prisma.articleTag.findMany({
      where: {
        tagId: { in: tagIds },
        articleId: { not: excludeId },
      },
      take: limit * 2,
    });
    return Array.from(new Set(links.map((l) => l.articleId))).slice(0, limit);
  }
}
