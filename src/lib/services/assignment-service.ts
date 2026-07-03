import { ApplicationService } from "./base/application-service";
import { AssignmentRepository } from "@/lib/repositories/assignment-repository";
import { NotFoundError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

export class AssignmentService extends ApplicationService {
  constructor(private readonly assignmentRepository: AssignmentRepository) {
    super("service/assignment");
  }

  async createAssignment(input: {
    title: string;
    reporterId: string;
    priority?: string;
    deadline: Date;
    notes?: string;
  }) {
    const history = [{ status: "ASSIGNED", date: new Date().toISOString() }];
    return this.assignmentRepository.create({
      ...input,
      history,
    });
  }

  async getAssignment(id: string) {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }
    return assignment;
  }

  async listAssignments() {
    return this.assignmentRepository.listAll();
  }

  async listAssignmentsByReporter(reporterId: string) {
    return this.assignmentRepository.listByReporter(reporterId);
  }

  async updateAssignmentStatus(id: string, status: string, comments?: string) {
    const assignment = await this.getAssignment(id);

    const history = Array.isArray(assignment.history)
      ? [...assignment.history]
      : [];
    history.push({ status, date: new Date().toISOString(), comments });

    return this.assignmentRepository.update(id, {
      status,
      editorComments: comments,
      history: history as Prisma.InputJsonValue,
    });
  }

  async updateAssignment(
    id: string,
    input: {
      title?: string;
      reporterId?: string;
      priority?: string;
      deadline?: Date;
      notes?: string;
    }
  ) {
    await this.getAssignment(id);
    return this.assignmentRepository.update(id, input);
  }

  async deleteAssignment(id: string) {
    await this.getAssignment(id);
    return this.assignmentRepository.delete(id);
  }
}
