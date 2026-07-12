/**
 * Standalone seed script.
 * Uses PrismaPg adapter (same as the app) but creates a fresh client
 * so it doesn't depend on Next.js hot-module globals.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/postgres";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding categories...");

  const categories = [
    { name: "Politics", slug: "politics" },
    { name: "Technology", slug: "technology" },
    { name: "Sports", slug: "sports" },
    { name: "Entertainment", slug: "entertainment" },
    { name: "Science", slug: "science" },
    { name: "Health", slug: "health" },
    { name: "Business", slug: "business" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`  ✓ ${category.name}`);
  }

  console.log("\nSeeding complete! 7 categories upserted.");

  console.log("\nSeeding permissions...");
  const permissionsList = [
    "category.create",
    "category.update",
    "category.delete",
    "category.view",
    "upload.signature.generate",
    "article.create",
    "article.publish",
    "article.schedule",
    "article.manage",
    "article.delete",
    "article.restore",
    "homepage.manage",
    "media.manage",
    "user.manage",
    "seo.manage",
    "analytics.view",
    "ads.manage",
    "notification.manage",
    "settings.manage",
    "audit.view",
    "location.manage",
    "author.manage",
    "reporter.manage",
    "tag.manage",
    "gallery.manage",
    "assignment.manage",
    "workflow.manage",
    "calendar.manage",
  ];

  const rolePermissionsMap = {
    REPORTER: [
      "upload.signature.generate",
      "article.create",
      "article.manage",
      "article.delete",
      "media.manage",
      "gallery.manage"
    ],
    EDITOR: [
      "upload.signature.generate",
      "article.create",
      "article.publish",
      "article.schedule",
      "article.manage",
      "article.delete",
      "article.restore",
      "category.view",
      "homepage.manage",
      "media.manage",
      "gallery.manage",
      "assignment.manage",
      "workflow.manage",
      "calendar.manage",
      "tag.manage",
      "location.manage",
      "author.manage",
      "reporter.manage"
    ],
    ADMIN: permissionsList,
  };

  for (const name of permissionsList) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const [role, perms] of Object.entries(rolePermissionsMap)) {
    for (const permName of perms) {
      const dbPerm = await prisma.permission.findUnique({ where: { name: permName } });
      if (dbPerm) {
        await prisma.rolePermission.upsert({
          where: {
            role_permissionId: {
              role: role as any,
              permissionId: dbPerm.id,
            },
          },
          update: {},
          create: {
            role: role as any,
            permissionId: dbPerm.id,
          },
        });
      }
    }
  }
  console.log("Permissions and role mappings seeded successfully!");

  console.log("\nSeeding Ad Slots...");
  const adSlots = [
    { name: "homepage-top-banner", description: "Top Banner on the Main Homepage" },
    { name: "homepage-sidebar", description: "Right Sidebar on the Main Homepage" },
    { name: "article-sidebar", description: "Right Sidebar next to an open Article" },
    { name: "article-inline", description: "Automatically inserted inside long Articles (Every 4 paragraphs)" }
  ];

  for (const slot of adSlots) {
    await prisma.adSlot.upsert({
      where: { name: slot.name },
      update: { description: slot.description },
      create: { name: slot.name, description: slot.description }
    });
  }
  console.log("Ad Slots seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
