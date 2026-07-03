import { ApplicationService } from "./base/application-service";
import { NotificationRepository } from "@/lib/repositories/notification-repository";

export class NotificationService extends ApplicationService {
  constructor(private readonly notificationRepository: NotificationRepository) {
    super("service/notification");
  }

  async sendNotification(userId: string, message: string) {
    return this.notificationRepository.create({ userId, message });
  }

  async listNotifications(userId: string) {
    return this.notificationRepository.listByUser(userId);
  }

  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
