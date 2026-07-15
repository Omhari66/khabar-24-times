import { PrismaRepository } from "@/lib/repositories/base/prisma-repository";
import { ReporterCardStatus } from "@prisma/client";

export class ReporterCardRepository extends PrismaRepository {
  async findById(id: string) {
    return this.prisma.reporter.findUnique({
      where: { id },
    });
  }

  async findByUuid(uuid: string) {
    return this.prisma.reporter.findUnique({
      where: { uuid },
    });
  }

  async findByQrToken(qrToken: string) {
    return this.prisma.reporter.findUnique({
      where: { qrToken },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.reporter.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.reporter.findUnique({
      where: { phone },
    });
  }

  async getLatestReporterId(year: number) {
    const prefix = `BS-${year}`;
    const latest = await this.prisma.reporter.findFirst({
      where: {
        reporterId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        reporterId: "desc",
      },
      select: {
        reporterId: true,
      },
    });
    return latest?.reporterId || null;
  }

  async findPage(params: {
    query?: string;
    status?: string;
    department?: string;
    state?: string;
    district?: string;
    skip: number;
    take: number;
  }) {
    const where = this.buildWhereClause(params);
    return this.prisma.reporter.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count(params: {
    query?: string;
    status?: string;
    department?: string;
    state?: string;
    district?: string;
  }) {
    const where = this.buildWhereClause(params);
    return this.prisma.reporter.count({ where });
  }

  private buildWhereClause(params: {
    query?: string;
    status?: string;
    department?: string;
    state?: string;
    district?: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (params.status) {
      where.status = params.status as ReporterCardStatus;
    }

    if (params.department) {
      where.department = { equals: params.department, mode: "insensitive" };
    }

    if (params.state) {
      where.state = { equals: params.state, mode: "insensitive" };
    }

    if (params.district) {
      where.district = { equals: params.district, mode: "insensitive" };
    }

    if (params.query) {
      const q = params.query.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { reporterId: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  async create(data: {
    reporterId: string;
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
    status?: ReporterCardStatus;
    dateOfBirth: Date;
    aadhaarLast4: string;
    emergencyContact: string;
    emergencyPhone: string;
    qrToken: string;
    createdBy: string;
  }) {
    return this.prisma.reporter.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
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
      status?: ReporterCardStatus;
      dateOfBirth?: Date;
      aadhaarLast4?: string;
      emergencyContact?: string;
      emergencyPhone?: string;
    }
  ) {
    return this.prisma.reporter.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.reporter.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return this.prisma.reporter.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async logVerification(data: {
    reporterId: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    browser?: string;
    os?: string;
    device?: string;
  }) {
    return this.prisma.verificationLog.create({
      data,
    });
  }

  async findVerificationLogsPage(params: { skip: number; take: number }) {
    return this.prisma.verificationLog.findMany({
      skip: params.skip,
      take: params.take,
      include: {
        reporter: {
          select: {
            fullName: true,
            reporterId: true,
            photo: true,
            designation: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async countVerificationLogs() {
    return this.prisma.verificationLog.count();
  }

  async getStatusCounts() {
    const rawCounts = await this.prisma.reporter.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const counts = {
      TOTAL: 0,
      ACTIVE: 0,
      SUSPENDED: 0,
      EXPIRED: 0,
    };

    for (const item of rawCounts) {
      if (item.status === ReporterCardStatus.ACTIVE) {
        counts.ACTIVE = item._count.status;
      } else if (item.status === ReporterCardStatus.SUSPENDED) {
        counts.SUSPENDED = item._count.status;
      } else if (item.status === ReporterCardStatus.EXPIRED) {
        counts.EXPIRED = item._count.status;
      }
    }

    counts.TOTAL = counts.ACTIVE + counts.SUSPENDED + counts.EXPIRED;
    return counts;
  }

  async getRecentScans(take = 5) {
    return this.prisma.verificationLog.findMany({
      take,
      include: {
        reporter: {
          select: {
            fullName: true,
            reporterId: true,
            photo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getRecentReporters(take = 5) {
    return this.prisma.reporter.findMany({
      take,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getTopScannedReporters(take = 5) {
    const scansByReporter = await this.prisma.verificationLog.groupBy({
      by: ["reporterId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take,
    });

    const results = [];
    for (const item of scansByReporter) {
      const reporter = await this.prisma.reporter.findUnique({
        where: { id: item.reporterId },
        select: {
          fullName: true,
          reporterId: true,
          photo: true,
          designation: true,
        },
      });

      if (reporter) {
        results.push({
          ...reporter,
          scans: item._count.id,
        });
      }
    }

    return results;
  }

  async getMonthlyScansTrend() {
    const rawLogs = await this.prisma.verificationLog.findMany({
      select: {
        createdAt: true,
      },
    });

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyCounts: Record<string, number> = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyCounts[key] = 0;
    }

    for (const log of rawLogs) {
      const logDate = new Date(log.createdAt);
      const key = `${months[logDate.getMonth()]} ${logDate.getFullYear()}`;
      if (key in monthlyCounts) {
        monthlyCounts[key]++;
      }
    }

    return Object.keys(monthlyCounts).map((name) => ({
      name,
      scans: monthlyCounts[name],
    }));
  }
}
