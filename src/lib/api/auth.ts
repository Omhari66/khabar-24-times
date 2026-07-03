import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { updateAuditContext } from "@/lib/audit/context";

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new UnauthorizedError("Unauthorized");
  }

  updateAuditContext({
    userId: session.user.id,
    userRole: session.user.role,
  });

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();

  if (session.user.role !== "ADMIN") {
    throw new ForbiddenError("Forbidden: Admins only");
  }

  return session;
}
