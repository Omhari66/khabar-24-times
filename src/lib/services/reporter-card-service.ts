import { ApplicationService } from "@/lib/services/base/application-service";
import { ReporterCardRepository } from "@/lib/repositories/reporter-card-repository";
import { AuditRepository } from "@/lib/repositories/audit-repository";
import { AuditService } from "@/lib/services/audit-service";
import { ConflictError, NotFoundError, BadRequestError } from "@/lib/errors";
import { ReporterCardStatus } from "@prisma/client";
import crypto from "crypto";

export class ReporterCardService extends ApplicationService {
  constructor(
    private readonly repository: ReporterCardRepository,
    private readonly auditService: AuditService
  ) {
    super("service/reporter-card");
  }

  async listReporters(params: {
    query?: string;
    status?: string;
    department?: string;
    state?: string;
    district?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    const [reporters, total] = await Promise.all([
      this.repository.findPage({ ...params, skip, take }),
      this.repository.count(params),
    ]);

    // Check expiry dynamically
    const updatedReporters = reporters.map((reporter) => {
      const now = new Date();
      if (reporter.status === ReporterCardStatus.ACTIVE && now > new Date(reporter.validTill)) {
        return { ...reporter, status: ReporterCardStatus.EXPIRED };
      }
      return reporter;
    });

    return { reporters: updatedReporters, total };
  }

  async getReporter(id: string) {
    const reporter = await this.repository.findById(id);
    if (!reporter) {
      throw new NotFoundError("Reporter card not found");
    }

    const now = new Date();
    if (reporter.status === ReporterCardStatus.ACTIVE && now > new Date(reporter.validTill)) {
      return { ...reporter, status: ReporterCardStatus.EXPIRED };
    }

    return reporter;
  }

  async getReporterByUuid(uuid: string) {
    const reporter = await this.repository.findByUuid(uuid);
    if (!reporter) {
      throw new NotFoundError("Reporter card not found");
    }

    const now = new Date();
    if (reporter.status === ReporterCardStatus.ACTIVE && now > new Date(reporter.validTill)) {
      return { ...reporter, status: ReporterCardStatus.EXPIRED };
    }

    return reporter;
  }

  async getReporterByQrToken(qrToken: string) {
    const reporter = await this.repository.findByQrToken(qrToken);
    if (!reporter) {
      throw new NotFoundError("Verification failed: Invalid QR code");
    }

    const now = new Date();
    if (reporter.status === ReporterCardStatus.ACTIVE && now > new Date(reporter.validTill)) {
      return { ...reporter, status: ReporterCardStatus.EXPIRED };
    }

    return reporter;
  }

  async createReporter(
    input: {
      fullName: string;
      photo: string;
      email: string;
      phone: string;
      bloodGroup: string;
      designation: string;
      department: string;
      state: string;
      district: string;
      officeAddress: string;
      joiningDate: Date;
      validTill: Date;
      dateOfBirth: Date;
      aadhaarLast4: string;
      emergencyContact: string;
      emergencyPhone: string;
    },
    adminUserId: string
  ) {
    // Check duplicates
    const [dupEmail, dupPhone] = await Promise.all([
      this.repository.findByEmail(input.email),
      this.repository.findByPhone(input.phone),
    ]);

    if (dupEmail) throw new ConflictError("A reporter with this email already exists");
    if (dupPhone) throw new ConflictError("A reporter with this phone number already exists");

    // Generate secure random QR token (16-char hex)
    const qrToken = crypto.randomBytes(8).toString("hex");

    // Generate auto-incrementing reporter ID (e.g. BS-20260001)
    const currentYear = new Date().getFullYear();
    const latestId = await this.repository.getLatestReporterId(currentYear);
    
    let serial = 1;
    if (latestId) {
      const parts = latestId.split("-");
      if (parts.length === 2) {
        const numPart = parts[1].substring(4); // Exclude year: BS-20260001 -> 0001
        const num = parseInt(numPart, 10);
        if (!isNaN(num)) {
          serial = num + 1;
        }
      }
    }

    const serialStr = String(serial).padStart(4, "0");
    const reporterId = `BS-${currentYear}${serialStr}`;

    const reporter = await this.repository.create({
      ...input,
      reporterId,
      qrToken,
      createdBy: adminUserId,
    });

    await this.auditService.log({
      action: "REPORTER_CREATE",
      entityType: "Reporter",
      entityId: reporter.id,
      newValue: reporter,
      status: "SUCCESS",
      userId: adminUserId,
    });

    return reporter;
  }

  async updateReporter(
    id: string,
    input: {
      fullName?: string;
      photo?: string;
      email?: string;
      phone?: string;
      bloodGroup?: string;
      designation?: string;
      department?: string;
      state?: string;
      district?: string;
      officeAddress?: string;
      joiningDate?: Date;
      validTill?: Date;
      dateOfBirth?: Date;
      aadhaarLast4?: string;
      emergencyContact?: string;
      emergencyPhone?: string;
    },
    adminUserId: string
  ) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reporter card not found");
    }

    // Check duplicates
    if (input.email && input.email !== existing.email) {
      const dup = await this.repository.findByEmail(input.email);
      if (dup) throw new ConflictError("A reporter with this email already exists");
    }

    if (input.phone && input.phone !== existing.phone) {
      const dup = await this.repository.findByPhone(input.phone);
      if (dup) throw new ConflictError("A reporter with this phone number already exists");
    }

    const updated = await this.repository.update(id, input);

    await this.auditService.log({
      action: "REPORTER_UPDATE",
      entityType: "Reporter",
      entityId: id,
      previousValue: existing,
      newValue: updated,
      status: "SUCCESS",
      userId: adminUserId,
    });

    return updated;
  }

  async deleteReporter(id: string, adminUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reporter card not found");
    }

    await this.repository.delete(id);

    await this.auditService.log({
      action: "REPORTER_DELETE",
      entityType: "Reporter",
      entityId: id,
      previousValue: existing,
      status: "SUCCESS",
      userId: adminUserId,
    });

    return { success: true };
  }

  async deleteManyReporters(ids: string[], adminUserId: string) {
    await this.repository.deleteMany(ids);

    await this.auditService.log({
      action: "REPORTER_BULK_DELETE",
      entityType: "Reporter",
      newValue: { ids },
      status: "SUCCESS",
      userId: adminUserId,
    });

    return { success: true };
  }

  async toggleStatus(id: string, adminUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reporter card not found");
    }

    const newStatus =
      existing.status === ReporterCardStatus.ACTIVE
        ? ReporterCardStatus.SUSPENDED
        : ReporterCardStatus.ACTIVE;

    const updated = await this.repository.update(id, { status: newStatus });

    await this.auditService.log({
      action: newStatus === ReporterCardStatus.ACTIVE ? "REPORTER_REACTIVATE" : "REPORTER_SUSPEND",
      entityType: "Reporter",
      entityId: id,
      previousValue: { status: existing.status },
      newValue: { status: updated.status },
      status: "SUCCESS",
      userId: adminUserId,
    });

    return updated;
  }

  async renewCard(id: string, newValidTill: Date, adminUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError("Reporter card not found");
    }

    const updated = await this.repository.update(id, {
      validTill: newValidTill,
      status: ReporterCardStatus.ACTIVE, // Reset to active on renewal
    });

    await this.auditService.log({
      action: "REPORTER_RENEW",
      entityType: "Reporter",
      entityId: id,
      previousValue: { validTill: existing.validTill, status: existing.status },
      newValue: { validTill: updated.validTill, status: updated.status },
      status: "SUCCESS",
      userId: adminUserId,
    });

    return updated;
  }

  async verifyCardByToken(
    qrToken: string,
    clientDetails?: {
      ipAddress?: string;
      country?: string;
      city?: string;
      browser?: string;
      os?: string;
      device?: string;
    }
  ) {
    const reporter = await this.repository.findByQrToken(qrToken);
    if (!reporter) {
      throw new NotFoundError("Verification failed: Identity token not found");
    }

    // Dynamic expiry evaluation
    let finalStatus = reporter.status;
    const now = new Date();
    if (reporter.status === ReporterCardStatus.ACTIVE && now > new Date(reporter.validTill)) {
      finalStatus = ReporterCardStatus.EXPIRED;
      // Auto-update to database asynchronously (not blocking response)
      this.repository.update(reporter.id, { status: ReporterCardStatus.EXPIRED }).catch(() => {});
    }

    // Log the verification attempt
    await this.repository.logVerification({
      reporterId: reporter.id,
      ...clientDetails,
    });

    return {
      reporter,
      status: finalStatus,
    };
  }

  async getAnalyticsOverview() {
    const [counts, recentScans, recentReporters, topScanned, scansTrend] = await Promise.all([
      this.repository.getStatusCounts(),
      this.repository.getRecentScans(6),
      this.repository.getRecentReporters(5),
      this.repository.getTopScannedReporters(5),
      this.repository.getMonthlyScansTrend(),
    ]);

    return {
      counts,
      recentScans,
      recentReporters,
      topScanned,
      scansTrend,
    };
  }

  async getVerificationLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [logs, total] = await Promise.all([
      this.repository.findVerificationLogsPage({ skip, take }),
      this.repository.countVerificationLogs(),
    ]);

    return { logs, total };
  }

  async importReportersFromCsv(csvText: string, adminUserId: string) {
    // Simple CSV parser
    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) {
      throw new BadRequestError("Empty CSV file or header-only CSV provided");
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const createdReporters = [];
    const errors = [];

    // Map headers to fields
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split while taking care of commas inside quotes
      const values: string[] = [];
      let currentVal = "";
      let inQuotes = false;
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentVal.trim().replace(/^"|"$/g, ""));
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^"|"$/g, ""));

      if (values.length < headers.length) {
        errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      // Convert array into object
      const rowData: Record<string, string> = {};
      headers.forEach((header, idx) => {
        rowData[header] = values[idx] || "";
      });

      try {
        // Validate required fields
        const {
          fullName,
          photo,
          email,
          phone,
          bloodGroup,
          designation,
          department,
          state,
          district,
          officeAddress,
          dateOfBirth,
          joiningDate,
          validTill,
          aadhaarLast4,
          emergencyContact,
          emergencyPhone,
        } = rowData;

        if (!fullName || !email || !phone || !designation || !department) {
          throw new Error("Missing primary details (Name, Email, Phone, Designation, Department)");
        }

        const parsedDob = dateOfBirth ? new Date(dateOfBirth) : new Date("1990-01-01");
        const parsedJoining = joiningDate ? new Date(joiningDate) : new Date();
        const parsedValidTill = validTill ? new Date(validTill) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        const reporter = await this.createReporter(
          {
            fullName,
            photo: photo || "https://res.cloudinary.com/dq6c8h2g0/image/upload/v1700000000/placeholder-avatar.jpg",
            email,
            phone,
            bloodGroup: bloodGroup || "O+",
            designation,
            department,
            state: state || "Delhi",
            district: district || "New Delhi",
            officeAddress: officeAddress || "HQ office",
            dateOfBirth: parsedDob,
            joiningDate: parsedJoining,
            validTill: parsedValidTill,
            aadhaarLast4: aadhaarLast4 || "0000",
            emergencyContact: emergencyContact || "HR Desk",
            emergencyPhone: emergencyPhone || phone,
          },
          adminUserId
        );

        createdReporters.push(reporter);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Row ${i + 1}: ${errorMsg}`);
      }
    }

    await this.auditService.log({
      action: "REPORTER_BULK_IMPORT",
      entityType: "Reporter",
      newValue: {
        totalRows: lines.length - 1,
        successCount: createdReporters.length,
        failCount: errors.length,
        errors,
      },
      status: createdReporters.length > 0 ? "SUCCESS" : "FAILURE",
      userId: adminUserId,
    });

    return {
      successCount: createdReporters.length,
      failCount: errors.length,
      errors,
    };
  }

  async exportReportersToCsv(params: {
    query?: string;
    status?: string;
    department?: string;
    state?: string;
    district?: string;
  }) {
    // Fetch all matching records without pagination limit
    const reporters = await this.repository.findPage({
      ...params,
      skip: 0,
      take: 100000,
    });

    const headers = [
      "Reporter ID",
      "Full Name",
      "Email",
      "Phone",
      "Designation",
      "Department",
      "Blood Group",
      "Status",
      "Joining Date",
      "Valid Till",
      "State",
      "District",
      "Aadhaar (Last 4)",
      "Emergency Contact",
      "Emergency Phone",
      "Verification Token",
    ];

    const escapeCsv = (str: string) => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = reporters.map((r) => [
      escapeCsv(r.reporterId),
      escapeCsv(r.fullName),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(r.designation),
      escapeCsv(r.department),
      escapeCsv(r.bloodGroup),
      escapeCsv(r.status),
      escapeCsv(r.joiningDate.toISOString().split("T")[0]),
      escapeCsv(r.validTill.toISOString().split("T")[0]),
      escapeCsv(r.state),
      escapeCsv(r.district),
      escapeCsv(r.aadhaarLast4),
      escapeCsv(r.emergencyContact),
      escapeCsv(r.emergencyPhone),
      escapeCsv(r.qrToken),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    return csvContent;
  }
}

export const reporterCardService = new ReporterCardService(
  new ReporterCardRepository(),
  new AuditService(new AuditRepository())
);
