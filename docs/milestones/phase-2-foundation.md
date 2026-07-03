# Phase 2 Foundation

## Scope

This milestone implements the entire Phase 2 backend foundation in a single, backward-compatible batch. It introduces Location Hierarchy, Author Profiles, Reporter Profiles, a Tag System with merge capabilities, and Category schema improvements.

## Architecture

1. **Location Hierarchy**:
   - Implements self-contained additive tables: `Country`, `State`, `District`, `City`, and `Area` to model location hierarchies.
   - Connects each layer with cascades to prevent dangling records.

2. **Author System**:
   - Introduces `AuthorProfile` containing bio, slug, avatarUrl, and socialLinks.
   - Integrates with the validation and permission layers (`author.manage`).

3. **Reporter System**:
   - Introduces `ReporterProfile` detailing beat, desk, status, contact, and assignment readiness.
   - Protects access and operations using the `reporter.manage` permission.

4. **Tag System**:
   - Implements `Tag` and `ArticleTag` (many-to-many link) tables.
   - Provides administrative tag merge support to merge references safely and delete duplicate links.

5. **Category Improvements**:
   - Expands the existing `Category` model with additive fields: `order`, visibility (`navVisible`, `homeVisible`), style (`icon`, `color`), `description`, and self-referencing parent-child properties (`parentId`, `parent`, `children`).
   - Adapts `CategoryRepository` to sort listings by `order` then `name`.

## Files Added

- [location-repository.ts](file:///E:/News_Portal/src/lib/repositories/location-repository.ts): Datastore operations for locations.
- [location-service.ts](file:///E:/News_Portal/src/lib/services/location-service.ts): Orchestration service for locations.
- [author-repository.ts](file:///E:/News_Portal/src/lib/repositories/author-repository.ts): Datastore operations for author profiles.
- [author-service.ts](file:///E:/News_Portal/src/lib/services/author-service.ts): Orchestration service for author profiles.
- [reporter-repository.ts](file:///E:/News_Portal/src/lib/repositories/reporter-repository.ts): Datastore operations for reporter profiles.
- [reporter-service.ts](file:///E:/News_Portal/src/lib/services/reporter-service.ts): Orchestration service for reporter profiles.
- [tag-repository.ts](file:///E:/News_Portal/src/lib/repositories/tag-repository.ts): Datastore operations for tags and tag merges.
- [tag-service.ts](file:///E:/News_Portal/src/lib/services/tag-service.ts): Orchestration service for tag actions.
- **Route Controllers**:
  - `src/app/api/admin/tags/route.ts` & `[id]/route.ts` & `[id]/merge/route.ts`
  - `src/app/api/admin/locations/countries/route.ts`
  - `src/app/api/admin/locations/states/route.ts`
  - `src/app/api/admin/locations/districts/route.ts`
  - `src/app/api/admin/locations/cities/route.ts`
  - `src/app/api/admin/locations/areas/route.ts`
  - `src/app/api/admin/authors/route.ts` & `[id]/route.ts`
  - `src/app/api/admin/reporters/route.ts` & `[id]/route.ts`
- [phase-2-foundation.md](file:///E:/News_Portal/docs/milestones/phase-2-foundation.md): Milestone architecture documentation.

## Files Modified

- [schema.prisma](file:///E:/News_Portal/prisma/schema.prisma): Added Phase 2 models and expanded `Category` model.
- [registry.ts](file:///E:/News_Portal/src/lib/permissions/registry.ts): Registered Phase 2 permissions (`location.manage`, `author.manage`, `reporter.manage`, `tag.manage`).
- [index.ts (repositories)](file:///E:/News_Portal/src/lib/repositories/index.ts): Exported repositories.
- [index.ts (services)](file:///E:/News_Portal/src/lib/services/index.ts): Exported services.
- [seed.ts](file:///E:/News_Portal/prisma/seed.ts): Seeded Phase 2 default permissions.
- [category-repository.ts](file:///E:/News_Portal/src/lib/repositories/category-repository.ts): Added fields to category schema mapping and sorted query results.
- [category-service.ts](file:///E:/News_Portal/src/lib/services/category-service.ts): Wired category updates and validation for parents.
- [PROJECT_PROGRESS.md](file:///E:/News_Portal/PROJECT_PROGRESS.md): Logged Phase 2 completion.

## Rollback Strategy

1. Revert schema alterations in `prisma/schema.prisma` and sync database.
2. Remove added API route directories, repositories, and services.
