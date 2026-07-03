import { withApiHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";

export const GET = withApiHandler({ scope: "api/admin/audit-logs:read" }, async () => {
  const session = await requireSession();
  
  if (session.user.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return apiSuccess(logs);
});
