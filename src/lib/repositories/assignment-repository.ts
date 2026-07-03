import { PrismaRepository } from "./base/prisma-repository";
import { Prisma } from "@prisma/client";

export class AssignmentRepository extends PrismaRepository {
  async create(data: {
    title: string;
    reporterId: string;
    priority?: string;
    deadline: Date;
    notes?: string | null;
    editorComments?: string | null;
    history?: Prisma.InputJsonValue;
  }) {
    return this.prisma.assignment.create({ data });
  }

  async findById(id: string) {
    return this.prisma.assignment.findUnique({ where: { id } });
  }

  async listAll() {
    return this.prisma.assignment.findMany({ orderBy: { createdAt: "desc" } });
  }

  async listByReporter(reporterId: string) {
    return this.prisma.assignment.findMany({
      where: { reporterId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      reporterId?: string;
      priority?: string;
      deadline?: Date;
      status?: string;
      notes?: string | null;
      editorComments?: string | null;
      history?: Prisma.InputJsonValue;
    }
  ) {
    return this.prisma.assignment.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.assignment.delete({ where: { id } });
  }
}
