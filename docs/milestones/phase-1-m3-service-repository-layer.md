# Phase 1 Milestone 3: Service and Repository Layer Introduction

## Scope

This milestone introduces service and repository layers for the `Categories` and `Upload Signature` domains only.

## Included changes

- Added a base Prisma repository pattern.
- Added a category repository for Prisma-only category data access.
- Added a base application service pattern.
- Added category and upload-signature services for orchestration logic.
- Refactored the migrated route handlers into thin controllers.

## Architectural intent

For migrated domains, responsibility now flows as:

Route Handler  
Service Layer  
Repository Layer  
Prisma

## Guardrails

- No route names changed.
- No response body shapes changed.
- No authentication behavior changed.
- No Prisma schema changes were made.
- No UI behavior changed.

## Rollback

Revert the new `services` and `repositories` files and restore direct route-level logic in the migrated handlers.
