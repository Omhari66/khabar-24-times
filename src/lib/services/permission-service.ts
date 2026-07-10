import { Role } from "@prisma/client";
import { ApplicationService } from "@/lib/services/base/application-service";
import { PermissionRepository } from "@/lib/repositories/permission-repository";
import { PermissionCache } from "@/lib/permissions/cache";
import { PermissionName, Permissions } from "@/lib/permissions/registry";

// Default permission mappings for fallback / initialization
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionName[]> = {
  REPORTER: [Permissions.UPLOAD_SIGNATURE_GENERATE],
  EDITOR: [Permissions.UPLOAD_SIGNATURE_GENERATE],
  ADMIN: Object.values(Permissions),
  USER: [],
};

export class PermissionService extends ApplicationService {
  constructor(private readonly permissionRepository: PermissionRepository) {
    super("service/permission");
  }

  /**
   * Initializes permissions in the database if they do not exist
   */
  async initializeRegistry(): Promise<void> {
    try {
      const allPermissions = Object.values(Permissions);
      for (const name of allPermissions) {
        await this.permissionRepository.savePermission(name);
      }

      // Seed default role permissions
      for (const role of Object.keys(DEFAULT_ROLE_PERMISSIONS) as Role[]) {
        const perms = DEFAULT_ROLE_PERMISSIONS[role];
        for (const permName of perms) {
          await this.permissionRepository.saveRolePermission(role, permName);
        }
      }
      PermissionCache.clear();
    } catch (error) {
      this.logger.error("Failed to initialize permission registry", { error });
    }
  }

  async hasPermission(userId: string, role: Role, permissionName: PermissionName): Promise<boolean> {
    // ADMIN has all permissions implicitly
    if (role === Role.ADMIN) {
      return true;
    }

    const userPermissions = await this.resolveUserPermissions(userId, role);
    return userPermissions.has(permissionName);
  }

  async resolveUserPermissions(userId: string, role: Role): Promise<Set<string>> {
    // Check user cache first
    const cached = PermissionCache.getUserPermissions(userId);
    if (cached) {
      return cached;
    }

    const resolved = new Set<string>();

    // 1. Get role permissions (with cache fallback)
    let rolePerms = PermissionCache.getRolePermissions(role);
    if (!rolePerms) {
      try {
        const dbPerms = await this.permissionRepository.getPermissionsForRole(role);
        if (dbPerms.length > 0) {
          rolePerms = new Set(dbPerms);
        } else {
          // Fallback to defaults
          rolePerms = new Set(DEFAULT_ROLE_PERMISSIONS[role]);
        }
      } catch (error) {
        this.logger.error("Failed to fetch role permissions from database", { error, role });
        rolePerms = new Set(DEFAULT_ROLE_PERMISSIONS[role]);
      }
      PermissionCache.setRolePermissions(role, rolePerms);
    }

    // Add role permissions
    rolePerms.forEach((p) => {
      resolved.add(p);
    });

    // 2. Load user overrides
    try {
      const overrides = await this.permissionRepository.getOverridesForUser(userId);
      for (const override of overrides) {
        if (override.type === "ALLOW") {
          resolved.add(override.permission.name);
        } else if (override.type === "DENY") {
          resolved.delete(override.permission.name);
        }
      }
    } catch (error) {
      this.logger.error("Failed to load user permission overrides", { error, userId });
    }

    PermissionCache.setUserPermissions(userId, resolved);
    return resolved;
  }
}
