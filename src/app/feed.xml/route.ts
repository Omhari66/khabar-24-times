import { prisma } from '@/lib/prisma';
import { extractPlainText } from '../(public)/components/TiptapRenderer';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.khabar24times.in';

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    }
  });

  const rssItems = articles
    .map((article) => {
      const url = `${baseUrl}/article/${article.slug}`;
      const description = extractPlainText(article.content, 200).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const pubDate = article.publishedAt ? new Date(article.publishedAt).toUTCString() : new Date(article.createdAt).toUTCString();

      return `
        <item>
          <title><![CDATA[${article.title}]]></title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <pubDate>${pubDate}</pubDate>
          <description><![CDATA[${description}]]></description>
          <category><![CDATA[${article.category.name}]]></category>
          <author>${article.author?.name || "Khabar 24 Times Desk"}</author>
        </item>
      `;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Khabar 24 Times</title>
      <link>${baseUrl}</link>
      <description>Reliable Indian News</description>
      <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
      <language>en-in</language>
      ${rssItems}
    </channel>
  </rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
