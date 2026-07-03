# Phase 1 Milestone 4: Centralized Audit Logging and Activity Tracking

## Scope

This milestone introduces a reusable, append-only backend audit logging and activity tracking system, integrating it with authentication logins, category changes, and upload signature generation.

## Architecture

1. **AuditContext (`src/lib/audit/context.ts`)**:
   - Manages request-scoped storage using Node's `AsyncLocalStorage`.
   - Automatically tracks HTTP parameters (path, method, IP, user-agent).
   - Dynamically updates with authenticated user details (`userId`, `userRole`) upon request verification.

2. **AuditRepository (`src/lib/repositories/audit-repository.ts`)**:
   - Handles strict, append-only persistence of audit logs to the `AuditLog` table using Prisma. No update or delete methods are exposed.

3. **AuditService (`src/lib/services/audit-service.ts`)**:
   - Orchestrates audit logging from the Service Layer.
   - Merges transient request context with dynamic action details.
   - Logs failures gracefully to the application logger rather than crashing the main API flow.

## Files Added

- [context.ts](file:///E:/News_Portal/src/lib/audit/context.ts): Context store wrapper using `AsyncLocalStorage`.
- [audit-repository.ts](file:///E:/News_Portal/src/lib/repositories/audit-repository.ts): Database access layer for audit records.
- [audit-service.ts](file:///E:/News_Portal/src/lib/services/audit-service.ts): Orchestration service layer logic.
- [phase-1-m4-audit-logging.md](file:///E:/News_Portal/docs/milestones/phase-1-m4-audit-logging.md): Milestone architecture documentation.

## Files Modified

- [schema.prisma](file:///E:/News_Portal/prisma/schema.prisma): Added `AuditLog` model.
- [index.ts (repositories)](file:///E:/News_Portal/src/lib/repositories/index.ts): Exported `AuditRepository`.
- [index.ts (services)](file:///E:/News_Portal/src/lib/services/index.ts): Exported `AuditService`.
- [handler.ts](file:///E:/News_Portal/src/lib/api/handler.ts): Integrated `runWithAuditContext` into `withApiHandler`.
- [auth.ts (api)](file:///E:/News_Portal/src/lib/api/auth.ts): Populated audit context with session info in `requireSession`.
- [route.ts (nextauth)](file:///E:/News_Portal/src/app/api/auth/%5B...nextauth%5D/route.ts): Wrapped auth API handlers in `runWithAuditContext`.
- [auth.ts (nextauth options)](file:///E:/News_Portal/src/lib/auth.ts): Logged successful sign-in events using `AuditService`.
- [category-service.ts](file:///E:/News_Portal/src/lib/services/category-service.ts): Added audit triggers to Category CRUD operations.
- [upload-signature-service.ts](file:///E:/News_Portal/src/lib/services/upload-signature-service.ts): Added audit trigger to signature generation.
- [route.ts (upload signature)](file:///E:/News_Portal/src/app/api/upload-signature/route.ts): Adjusted to await signature generation.
- [prisma.ts](file:///E:/News_Portal/src/lib/prisma.ts): Increased connection timeout and limited max pool size to avoid Neon connection saturation.
- [PROJECT_PROGRESS.md](file:///E:/News_Portal/PROJECT_PROGRESS.md): Documented milestone completion.

## Rollback Strategy

1. Revert schema alterations in `prisma/schema.prisma` and run `npx prisma db push` to drop the `AuditLog` table (or leave it as is if it's safe to remain).
2. Remove the added audit folders (`src/lib/audit`) and repository/service files.
3. Revert modified route handlers and service files to restore direct service behaviors.

## Future Extension Points

- **Asynchronous Queueing**: Update the `AuditService.log` implementation to forward logging requests to a queue (e.g. Redis/BullMQ or a background worker thread) to optimize request latency.
- **External Log Storage**: Adapt `AuditService` to stream records to external log collectors or search indexes (e.g. Elasticsearch, Datadog) by swapping or extending the repository adapter.
