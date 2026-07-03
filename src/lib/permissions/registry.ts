export const Permissions = {
  // Category management
  CATEGORY_CREATE: "category.create",
  CATEGORY_UPDATE: "category.update",
  CATEGORY_DELETE: "category.delete",
  CATEGORY_VIEW: "category.view",

  // Image Uploads
  UPLOAD_SIGNATURE_GENERATE: "upload.signature.generate",

  // Articles
  ARTICLE_CREATE: "article.create",
  ARTICLE_PUBLISH: "article.publish",
  ARTICLE_SCHEDULE: "article.schedule",
  ARTICLE_MANAGE: "article.manage",
  ARTICLE_DELETE: "article.delete",
  ARTICLE_RESTORE: "article.restore",

  // Homepage
  HOMEPAGE_MANAGE: "homepage.manage",

  // Media
  MEDIA_MANAGE: "media.manage",

  // Settings / Admin
  USER_MANAGE: "user.manage",
  SEO_MANAGE: "seo.manage",
  ANALYTICS_VIEW: "analytics.view",
  ADS_MANAGE: "ads.manage",
  NOTIFICATION_MANAGE: "notification.manage",
  SETTINGS_MANAGE: "settings.manage",
  AUDIT_VIEW: "audit.view",

  // Phase 2 Foundation
  LOCATION_MANAGE: "location.manage",
  AUTHOR_MANAGE: "author.manage",
  REPORTER_MANAGE: "reporter.manage",
  TAG_MANAGE: "tag.manage",

  // Phase 4 CMS
  GALLERY_MANAGE: "gallery.manage",
  ASSIGNMENT_MANAGE: "assignment.manage",
  WORKFLOW_MANAGE: "workflow.manage",
  CALENDAR_MANAGE: "calendar.manage",
} as const;

export type PermissionName = typeof Permissions[keyof typeof Permissions];
