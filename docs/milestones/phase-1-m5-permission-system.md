# Phase 1 Milestone 5: Permission-Based Authorization

## Scope

This milestone transitions route-level authorization checks from coarse, role-based checks to fine-grained permission tokens, with 100% backward compatibility for existing roles (`ADMIN`, `EDITOR`, `REPORTER`).

## Architecture

1. **Permission Registry (`src/lib/permissions/registry.ts`)**:
   - Central definition of all permission names as a read-only object mapping token names to permission strings (e.g. `category.create`, `upload.signature.generate`).

2. **Permission Cache (`src/lib/permissions/cache.ts`)**:
   - Provides thread-safe, in-memory caches mapping active user roles and custom overrides to Sets of permitted permission strings.

3. **Permission Repository (`src/lib/repositories/permission-repository.ts`)**:
   - Reads configured role permission links and custom user overrides from the database.

4. **Permission Service (`src/lib/services/permission-service.ts`)**:
   - Resolves a user's permissions by combining role-mapped permissions with specific ALLOW/DENY overrides.
   - Provides default, fallback mappings matching existing role expectations in case database tables are unpopulated or unseeded.

5. **Permission Guard (`src/lib/permissions/guard.ts`)**:
   - Offers `requirePermission` guard function. Invokes authentication session check and resolves user permission checks.

## Files Added

- [registry.ts](file:///E:/News_Portal/src/lib/permissions/registry.ts): Listing of all available permissions.
- [cache.ts](file:///E:/News_Portal/src/lib/permissions/cache.ts): Caching mechanism for resolved sets.
- [guard.ts](file:///E:/News_Portal/src/lib/permissions/guard.ts): Standard endpoint request route checks.
- [permission-repository.ts](file:///E:/News_Portal/src/lib/repositories/permission-repository.ts): Database accessor layer.
- [permission-service.ts](file:///E:/News_Portal/src/lib/services/permission-service.ts): Orchestration core resolver.
- [phase-1-m5-permission-system.md](file:///E:/News_Portal/docs/milestones/phase-1-m5-permission-system.md): Milestone architecture documentation.

## Files Modified

- [schema.prisma](file:///E:/News_Portal/prisma/schema.prisma): Added `Permission`, `RolePermission`, and `UserPermissionOverride` models.
- [index.ts (repositories)](file:///E:/News_Portal/src/lib/repositories/index.ts): Exported `PermissionRepository`.
- [index.ts (services)](file:///E:/News_Portal/src/lib/services/index.ts): Exported `PermissionService`.
- [seed.ts](file:///E:/News_Portal/prisma/seed.ts): Seeded default permissions and mappings into the database.
- [categories/route.ts](file:///E:/News_Portal/src/app/api/admin/categories/route.ts): Replaced `requireAdminSession` with `requirePermission`.
- [categories/[id]/route.ts](file:///E:/News_Portal/src/app/api/admin/categories/%5Bid%5D/route.ts): Replaced `requireAdminSession` with `requirePermission`.
- [upload-signature/route.ts](file:///E:/News_Portal/src/app/api/upload-signature/route.ts): Replaced `requireSession` with `requirePermission`.
- [PROJECT_PROGRESS.md](file:///E:/News_Portal/PROJECT_PROGRESS.md): Logged the completion of Phase 1, Milestone 5.

## Backward Compatibility Strategy

- Existing roles continue to act as before:
  - `ADMIN` always resolves to true (all permissions) in `PermissionService`.
  - Mappings for `EDITOR` and `REPORTER` are defined programmatically as static fallbacks.
  - If the database is missing permission links, resolving drops back to default role permission arrays, ensuring the application remains functional.

## Rollback Strategy

1. Revert schema alterations in `prisma/schema.prisma` and run `npx prisma db push` to drop new models if desired.
2. Remove `src/lib/permissions` folder and newly added repository/service files.
3. Restore `requireAdminSession()` or `requireSession()` calls in Categories and Upload Signature route controllers.
