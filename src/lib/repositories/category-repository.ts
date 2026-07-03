import { PrismaRepository } from "@/lib/repositories/base/prisma-repository";

export class CategoryRepository extends PrismaRepository {
  findAllWithArticleCounts() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: [
        { order: "asc" },
        { name: "asc" },
      ],
    });
  }

  findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
    });
  }

  findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  create(data: {
    name: string;
    slug: string;
    order?: number;
    navVisible?: boolean;
    homeVisible?: boolean;
    icon?: string;
    color?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    description?: string;
    parentId?: string;
  }) {
    return this.prisma.category.create({
      data,
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      order?: number;
      navVisible?: boolean;
      homeVisible?: boolean;
      icon?: string;
      color?: string;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      description?: string;
      parentId?: string | null;
    }
  ) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  countArticles(categoryId: string) {
    return this.prisma.article.count({
      where: { categoryId },
    });
  }

  delete(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
