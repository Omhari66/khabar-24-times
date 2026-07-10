"use server";

import { getInfiniteFeed } from "@/lib/services/public-queries";

export async function fetchFeedArticles(cursor?: string) {
  return getInfiniteFeed(cursor, 10);
}
