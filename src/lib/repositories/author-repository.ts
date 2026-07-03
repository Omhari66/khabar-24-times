import { PrismaRepository } from "./base/prisma-repository";
import { Prisma } from "@prisma/client";

export class AuthorRepository extends PrismaRepository {
  async findAll() {
    return this.prisma.authorProfile.findMany();
  }

  async findById(id: string) {
    return this.prisma.authorProfile.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.authorProfile.findUnique({ where: { slug } });
  }

  async findByUserId(userId: string) {
    return this.prisma.authorProfile.findUnique({ where: { userId } });
  }

  async create(data: {
    userId: string;
    bio?: string;
    slug: string;
    avatarUrl?: string;
    socialLinks?: Prisma.InputJsonValue;
  }) {
    return this.prisma.authorProfile.create({ data });
  }

  async update(
    id: string,
    data: {
      bio?: string;
      slug?: string;
      avatarUrl?: string;
      socialLinks?: Prisma.InputJsonValue;
    }
  ) {
    return this.prisma.authorProfile.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.authorProfile.delete({ where: { id } });
  }
}
