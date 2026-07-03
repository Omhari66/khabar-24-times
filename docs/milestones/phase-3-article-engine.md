# Phase 3 Article Engine

## Scope

This milestone implements the Article Engine. It expands the database layer with additive fields to track editorial settings, content parameters, dynamic breaking/trending flags, metadata, revision versions, scheduled publication windows, soft deletes, and automatic/manual related articles mapping.

## Architecture

1. **Article System Model Expansion**:
   - Expanded `Article` model with base data (subtitle, summary, excerpt, image captions, credit tags, edition, and language).
   - Added article flag indicators (Breaking, Featured, Trending, Editor's Pick, Live Coverage, Fact Check, Opinion, Sponsored, Exclusive, Premium).
   - Added meta title, description, canonical url, open graph images, focus keywords, and robots overrides for SEO configuration.

2. **Soft Delete & Restore**:
   - Integrated `deletedAt` timestamps. Soft-deleted articles are filtered out from default listings. Permanent deletion remains restricted to administrators.

3. **Revision History**:
   - Introduced `ArticleVersion` table mapping state history. Every revision auto-increments the version counter and stores the content delta and revision author metadata.

4. **Related Content Engine**:
   - Handled manual article mappings.
   - Handled fallback queries targeting matches dynamically across shared tag, category, and location metadata.

5. **Scheduled Publishing**:
   - Timezone-safe execution logic via the `SchedulingService` and `scheduledPublishAt` timestamps.

## Files Added

- [article-repository.ts](file:///E:/News_Portal/src/lib/repositories/article-repository.ts): Low-level CRUD, soft-deletes, revision tracking, and related article datastore queries.
- [article-service.ts](file:///E:/News_Portal/src/lib/services/article-service.ts): Service layer for article management and soft-delete/restores.
- [revision-service.ts](file:///E:/News_Portal/src/lib/services/revision-service.ts): Revision capturing and rollback restore operations.
- [scheduling-service.ts](file:///E:/News_Portal/src/lib/services/scheduling-service.ts): Scheduled publishing windows.
- [related-article-service.ts](file:///E:/News_Portal/src/lib/services/related-article-service.ts): Automatic and manual related article generation.
- [seo-service.ts](file:///E:/News_Portal/src/lib/services/seo-service.ts): SEO adjustments.
- **REST APIs**:
  - `src/app/api/admin/articles/route.ts` & `[id]/route.ts`
  - `src/app/api/admin/articles/[id]/restore/route.ts`
  - `src/app/api/admin/articles/[id]/revisions/route.ts`
  - `src/app/api/admin/articles/[id]/schedule/route.ts`
  - `src/app/api/admin/articles/[id]/related/route.ts`
  - `src/app/api/admin/articles/[id]/seo/route.ts`
- [phase-3-article-engine.md](file:///E:/News_Portal/docs/milestones/phase-3-article-engine.md): Milestone architecture documentation.

## Files Modified

- [schema.prisma](file:///E:/News_Portal/prisma/schema.prisma): Expanded `Article` model and appended version and related article relation tables.
- [registry.ts](file:///E:/News_Portal/src/lib/permissions/registry.ts): Registered new permission nodes.
- [index.ts (repositories)](file:///E:/News_Portal/src/lib/repositories/index.ts): Exported repositories.
- [index.ts (services)](file:///E:/News_Portal/src/lib/services/index.ts): Exported services.
- [seed.ts](file:///E:/News_Portal/prisma/seed.ts): Seeded Phase 3 default permissions.
- [PROJECT_PROGRESS.md](file:///E:/News_Portal/PROJECT_PROGRESS.md): Logged Phase 3 completion status.

## Rollback Strategy

1. Sync database by reverting the Prisma schema structure.
2. Remove added API route directories, services, and repositories.
