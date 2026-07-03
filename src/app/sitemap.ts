import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // We want the sitemap to be dynamic
export const revalidate = 3600; // but cache it for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bharatsentinel.in';

  // 1. Get recent published articles
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 1000,
    select: { slug: true, updatedAt: true },
  });

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 2. Get categories
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  // 3. Get static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
  ];

  return [...staticPages, ...categoryEntries, ...articleEntries];
}
