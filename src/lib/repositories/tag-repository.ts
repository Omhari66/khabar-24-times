import { PrismaRepository } from "./base/prisma-repository";

export class TagRepository extends PrismaRepository {
  async findAll() {
    return this.prisma.tag.findMany();
  }

  async findById(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.tag.findUnique({ where: { slug } });
  }

  async create(data: { name: string; slug: string }) {
    return this.prisma.tag.create({ data });
  }

  async update(id: string, data: { name?: string; slug?: string }) {
    return this.prisma.tag.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }

  async mergeTags(sourceTagId: string, targetTagId: string) {
    const sourceLinks = await this.prisma.articleTag.findMany({
      where: { tagId: sourceTagId },
    });

    for (const link of sourceLinks) {
      try {
        await this.prisma.articleTag.update({
          where: { id: link.id },
          data: { tagId: targetTagId },
        });
      } catch {
        await this.prisma.articleTag.delete({
          where: { id: link.id },
        });
      }
    }

    await this.prisma.tag.delete({ where: { id: sourceTagId } });
  }
}
