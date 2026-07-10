import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Cached category query — React's `cache()` deduplicates this so SiteHeader
 * and SiteFooter share a single DB round-trip per request, instead of two.
 */
export const getCachedCategories = cache(async () => {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    take: 12,
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      },
    },
  });
});
