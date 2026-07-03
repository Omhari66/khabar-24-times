import { PrismaRepository } from "./base/prisma-repository";
import { Prisma } from "@prisma/client";

export class AuditRepository extends PrismaRepository {
  async create(data: Prisma.AuditLogCreateInput) {
    return this.prisma.auditLog.create({
      data,
    });
  }
}
