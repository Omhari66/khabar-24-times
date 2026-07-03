import { ApplicationService } from "./base/application-service";
import { CalendarRepository } from "@/lib/repositories/calendar-repository";
import { NotFoundError } from "@/lib/errors";

export class CalendarService extends ApplicationService {
  constructor(private readonly calendarRepository: CalendarRepository) {
    super("service/calendar");
  }

  async createEvent(input: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    type?: string;
  }) {
    return this.calendarRepository.createEvent(input);
  }

  async getEvent(id: string) {
    const event = await this.calendarRepository.findEventById(id);
    if (!event) {
      throw new NotFoundError("Calendar event not found");
    }
    return event;
  }

  async listEvents(start?: Date, end?: Date) {
    return this.calendarRepository.listEvents(start, end);
  }

  async updateEvent(
    id: string,
    input: {
      title?: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
      type?: string;
    }
  ) {
    await this.getEvent(id);
    return this.calendarRepository.updateEvent(id, input);
  }

  async deleteEvent(id: string) {
    await this.getEvent(id);
    return this.calendarRepository.deleteEvent(id);
  }
}
