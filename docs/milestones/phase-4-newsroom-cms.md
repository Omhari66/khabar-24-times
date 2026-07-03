# Phase 4 Newsroom CMS

## Scope

This milestone implements the Newsroom CMS backend components including a complete Media Library (Asset/Folder trees), Photo Galleries, Editorial status transition management, Reporter Assignments, Cms Internal Notifications, and an Editorial Calendar.

## Architecture

1. **Media Library**:
   - `MediaFolder` and `MediaAsset` entities manage files and folders. Soft-delete hooks handle asset cleanups.

2. **Galleries**:
   - `PhotoGallery` and ordered `GalleryItem` links manage graphic slide-shows.

3. **Editorial Workflow**:
   - Orchestrated via `WorkflowService` ensuring that every status change (e.g. DRAFT to SUBMITTED to EDITOR_REVIEW to LEGAL_REVIEW to PUBLISHED) creates audit logs and sends real-time system notifications to authors.

4. **Assignments**:
   - `Assignment` tracks task allocation, deadlines, priorities, status flows, and editor comment histories.

5. **Notification Center**:
   - CMS system alerts read/unread states.

6. **Editorial Calendar**:
   - `CalendarEvent` schedules festivals, upcoming events, and planning milestones timezone-safely.

## Files Added

- **Repositories**:
  - [media-repository.ts](file:///E:/News_Portal/src/lib/repositories/media-repository.ts)
  - [gallery-repository.ts](file:///E:/News_Portal/src/lib/repositories/gallery-repository.ts)
  - [assignment-repository.ts](file:///E:/News_Portal/src/lib/repositories/assignment-repository.ts)
  - [notification-repository.ts](file:///E:/News_Portal/src/lib/repositories/notification-repository.ts)
  - [calendar-repository.ts](file:///E:/News_Portal/src/lib/repositories/calendar-repository.ts)
- **Services**:
  - [media-service.ts](file:///E:/News_Portal/src/lib/services/media-service.ts)
  - [gallery-service.ts](file:///E:/News_Portal/src/lib/services/gallery-service.ts)
  - [assignment-service.ts](file:///E:/News_Portal/src/lib/services/assignment-service.ts)
  - [notification-service.ts](file:///E:/News_Portal/src/lib/services/notification-service.ts)
  - [workflow-service.ts](file:///E:/News_Portal/src/lib/services/workflow-service.ts)
  - [calendar-service.ts](file:///E:/News_Portal/src/lib/services/calendar-service.ts)
- **APIs**:
  - `src/app/api/admin/media/route.ts` & `[id]/route.ts`
  - `src/app/api/admin/galleries/route.ts` & `[id]/route.ts` & `[id]/items/route.ts`
  - `src/app/api/admin/assignments/route.ts` & `[id]/route.ts`
  - `src/app/api/admin/workflow/route.ts`
  - `src/app/api/admin/notifications/route.ts` & `[id]/route.ts`
  - `src/app/api/admin/calendar/route.ts` & `[id]/route.ts`
- [phase-4-newsroom-cms.md](file:///E:/News_Portal/docs/milestones/phase-4-newsroom-cms.md): Milestone architecture documentation.

## Files Modified

- [schema.prisma](file:///E:/News_Portal/prisma/schema.prisma): Expanded `ArticleStatus` enum and added CMS models.
- [registry.ts](file:///E:/News_Portal/src/lib/permissions/registry.ts): Registered Phase 4 CMS permissions.
- [index.ts (repositories)](file:///E:/News_Portal/src/lib/repositories/index.ts): Exported repositories.
- [index.ts (services)](file:///E:/News_Portal/src/lib/services/index.ts): Exported services.
- [seed.ts](file:///E:/News_Portal/prisma/seed.ts): Seeded Phase 4 default permissions.
- [PROJECT_PROGRESS.md](file:///E:/News_Portal/PROJECT_PROGRESS.md): Logged Phase 4 CMS completion.

## Rollback Strategy

1. Sync database by reverting the schema changes.
2. Remove Phase 4 API endpoints, repositories, and services.
