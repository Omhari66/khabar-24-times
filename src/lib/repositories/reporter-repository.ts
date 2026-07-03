import { PrismaRepository } from "./base/prisma-repository";

export class ReporterRepository extends PrismaRepository {
  async findAll() {
    return this.prisma.reporterProfile.findMany();
  }

  async findById(id: string) {
    return this.prisma.reporterProfile.findUnique({ where: { id } });
  }

  async findByUserId(userId: string) {
    return this.prisma.reporterProfile.findUnique({ where: { userId } });
  }

  async create(data: {
    userId: string;
    beat?: string;
    desk?: string;
    status?: string;
    contact?: string;
    assignmentReady?: boolean;
  }) {
    return this.prisma.reporterProfile.create({ data });
  }

  async update(
    id: string,
    data: {
      beat?: string;
      desk?: string;
      status?: string;
      contact?: string;
      assignmentReady?: boolean;
    }
  ) {
    return this.prisma.reporterProfile.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.reporterProfile.delete({ where: { id } });
  }
}
