import { prisma } from "../prisma";

export class NewsletterService {
  /**
   * Subscribe an email
   */
  async subscribe(email: string, topics: string[] = []) {
    return prisma.newsletterSubscription.upsert({
      where: { email },
      update: { isActive: true, topics: JSON.stringify(topics) },
      create: { email, isActive: true, topics: JSON.stringify(topics) },
    });
  }

  /**
   * Unsubscribe an email
   */
  async unsubscribe(email: string) {
    return prisma.newsletterSubscription.update({
      where: { email },
      data: { isActive: false },
    });
  }

  /**
   * Dispatch a newsletter (Simulated hook for SMTP/SendGrid)
   */
  async dispatch(subject: string, bodyHtml: string, topic?: string) {
    // 1. Fetch active subscriptions matching the topic
    // 2. Build email payloads
    // 3. Dispatch to email service provider (SendGrid, AWS SES)
    // 4. Log delivery success/failure

    // Simulation log:
    console.log(`[NewsletterService] Dispatched email: "${subject}" to topic: ${topic || 'all'}`);
    
    // In a real implementation:
    // await prisma.newsletterDeliveryLog.create(...)
  }
}

export const newsletterService = new NewsletterService();
