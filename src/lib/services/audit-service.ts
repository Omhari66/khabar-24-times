import { ApplicationService } from "@/lib/services/base/application-service";
import { AuditRepository } from "@/lib/repositories/audit-repository";
import { getAuditContext } from "@/lib/audit/context";

export interface LogAuditParams {
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  status: "SUCCESS" | "FAILURE";
  userId?: string;
  userRole?: string;
}

export class AuditService extends ApplicationService {
  constructor(private readonly auditRepository: AuditRepository) {
    super("service/audit");
  }

  async log(params: LogAuditParams) {
    try {
      const context = getAuditContext() || {};

      const userId = params.userId || context.userId || null;
      const userRole = params.userRole || context.userRole || null;

      const record = {
        userId,
        userRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        requestPath: context.requestPath || null,
        requestMethod: context.requestMethod || null,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
        previousValue: params.previousValue ? JSON.parse(JSON.stringify(params.previousValue)) : null,
        newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
        status: params.status,
      };

      await this.auditRepository.create(record);
    } catch (error) {
      // Do not crash the application if audit logging fails
      this.logger.error("Failed to write audit log", { error, params });
    }
  }
}
