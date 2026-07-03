import { PrismaRepository } from "./base/prisma-repository";

export class CalendarRepository extends PrismaRepository {
  async createEvent(data: {
    title: string;
    description?: string | null;
    startDate: Date;
    endDate: Date;
    type?: string;
  }) {
    return this.prisma.calendarEvent.create({ data });
  }

  async findEventById(id: string) {
    return this.prisma.calendarEvent.findUnique({ where: { id } });
  }

  async listEvents(start?: Date, end?: Date) {
    return this.prisma.calendarEvent.findMany({
      where: {
        ...(start && end ? { startDate: { gte: start, lte: end } } : {}),
      },
      orderBy: { startDate: "asc" },
    });
  }

  async updateEvent(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      startDate?: Date;
      endDate?: Date;
      type?: string;
    }
  ) {
    return this.prisma.calendarEvent.update({ where: { id }, data });
  }

  async deleteEvent(id: string) {
    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}
