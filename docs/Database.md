# Database Schema

## Models
1. **User/Roles**: `User`, `Account`, `Session`.
2. **CMS Core**: `Article`, `Category`, `Author`, `Reporter`, `Tag`.
3. **Media**: `MediaAsset`, `MediaFolder`.
4. **Operations**: `AuditLog`, `Assignment`, `CalendarEvent`.
5. **Analytics**: `ArticleMetric`, `SystemHealthLog`, `AdImpression`.

## Migrations
Additive migrations only using `npx prisma db push` (or `migrate deploy` in strict CI environments).