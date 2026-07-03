export class PermissionCache {
  private static roleCache = new Map<string, Set<string>>();
  private static userCache = new Map<string, Set<string>>();

  static getRolePermissions(role: string): Set<string> | undefined {
    return this.roleCache.get(role);
  }

  static setRolePermissions(role: string, permissions: Set<string>): void {
    this.roleCache.set(role, permissions);
  }

  static getUserPermissions(userId: string): Set<string> | undefined {
    return this.userCache.get(userId);
  }

  static setUserPermissions(userId: string, permissions: Set<string>): void {
    this.userCache.set(userId, permissions);
  }

  static invalidateUser(userId: string): void {
    this.userCache.delete(userId);
  }

  static clear(): void {
    this.roleCache.clear();
    this.userCache.clear();
  }
}
