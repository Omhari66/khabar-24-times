import { ApplicationService } from "./base/application-service";
import { ReporterRepository } from "@/lib/repositories/reporter-repository";
import { ConflictError, NotFoundError } from "@/lib/errors";

export class ReporterService extends ApplicationService {
  constructor(private readonly reporterRepository: ReporterRepository) {
    super("service/reporter");
  }

  async listReporters() {
    return this.reporterRepository.findAll();
  }

  async getReporter(id: string) {
    const reporter = await this.reporterRepository.findById(id);
    if (!reporter) {
      throw new NotFoundError("Reporter profile not found");
    }
    return reporter;
  }

  async createReporter(input: {
    userId: string;
    beat?: string;
    desk?: string;
    status?: string;
    contact?: string;
    assignmentReady?: boolean;
  }) {
    const existing = await this.reporterRepository.findByUserId(input.userId);
    if (existing) {
      throw new ConflictError("A reporter profile already exists for this user");
    }
    return this.reporterRepository.create(input);
  }

  async updateReporter(
    id: string,
    input: {
      beat?: string;
      desk?: string;
      status?: string;
      contact?: string;
      assignmentReady?: boolean;
    }
  ) {
    const reporter = await this.reporterRepository.findById(id);
    if (!reporter) {
      throw new NotFoundError("Reporter profile not found");
    }
    return this.reporterRepository.update(id, input);
  }

  async deleteReporter(id: string) {
    const reporter = await this.reporterRepository.findById(id);
    if (!reporter) {
      throw new NotFoundError("Reporter profile not found");
    }
    return this.reporterRepository.delete(id);
  }
}
