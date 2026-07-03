import { prisma } from "@/lib/prisma";

export abstract class PrismaRepository {
  protected readonly prisma = prisma;
}
