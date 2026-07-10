import { prisma } from "@/lib/prisma";


export async function getTrendingTags(limit: number = 5) {
  // Ideally, this would use analytics data, but for now we fetch tags
  // associated with the most recent or featured articles.
  const tags = await prisma.tag.findMany({
    take: limit,
    orderBy: {
      articleTags: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  return tags;
}

export async function getTopStories(limit: number = 5) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      featured: true,
    },
    take: limit,
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      category: true,
      author: true,
    },
  });
}

export async function getLatestNews(limit: number = 10) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    take: limit,
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      category: true,
    },
  });
}


export async function getInfiniteFeed(cursor?: string, limit: number = 10) {
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
    },
    take: limit + 1, // Fetch one extra to check if there is a next page
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      category: true,
      author: true,
    },
    cursor: cursor ? { id: cursor } : undefined,
  });
  
  let nextCursor: string | undefined = undefined;
  if (articles.length > limit) {
    const nextItem = articles.pop(); // Remove the extra item
    nextCursor = nextItem!.id;
  }

  return {
    articles,
    nextCursor,
  };
}

export async function getTrendingPromoStories(limit: number = 3) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      trending: true,
    },
    take: limit,
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      category: true,
    },
  });
}
