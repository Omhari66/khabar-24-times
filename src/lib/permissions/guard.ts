import { requireSession } from "@/lib/api/auth";
import { ForbiddenError } from "@/lib/errors";
import { PermissionRepository } from "@/lib/repositories/permission-repository";
import { PermissionService } from "@/lib/services/permission-service";
import { PermissionName } from "./registry";

const permissionService = new PermissionService(new PermissionRepository());

export async function requirePermission(permissionName: PermissionName) {
  const session = await requireSession();

  const hasPerm = await permissionService.hasPermission(
    session.user.id,
    session.user.role,
    permissionName
  );

  if (!hasPerm) {
    throw new ForbiddenError(`Forbidden: Missing permission ${permissionName}`);
  }

  return session;
}
