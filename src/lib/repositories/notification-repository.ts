import { PrismaRepository } from "./base/prisma-repository";

export class NotificationRepository extends PrismaRepository {
  async create(data: { userId: string; message: string }) {
    return this.prisma.cmsNotification.create({ data });
  }

  async listByUser(userId: string) {
    return this.prisma.cmsNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.cmsNotification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.cmsNotification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
