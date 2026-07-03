import { PrismaRepository } from "./base/prisma-repository";
import { Role } from "@prisma/client";

export class PermissionRepository extends PrismaRepository {
  async getPermissionsForRole(role: Role): Promise<string[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });
    return rolePermissions.map((rp) => rp.permission.name);
  }

  async getOverridesForUser(userId: string) {
    return this.prisma.userPermissionOverride.findMany({
      where: { userId },
      include: { permission: true },
    });
  }

  async savePermission(name: string, description?: string) {
    return this.prisma.permission.upsert({
      where: { name },
      update: { description },
      create: { name, description },
    });
  }

  async saveRolePermission(role: Role, permissionName: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });
    if (!permission) {
      throw new Error(`Permission ${permissionName} not found`);
    }

    return this.prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role,
        permissionId: permission.id,
      },
    });
  }
}
