import { LatestNewsRail } from "./LatestNewsRail";
import { InfiniteArticleFeed } from "./InfiniteArticleFeed";
import { TrendingPromoRail } from "./TrendingPromoRail";
import { getInfiniteFeed } from "@/lib/services/public-queries";
import { AdBanner } from "./AdBanner";

export async function MainFeedLayout() {
  const initialFeed = await getInfiniteFeed(undefined, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Rail - Latest News */}
        <aside className="lg:col-span-3 hidden md:block">
          <LatestNewsRail />
        </aside>

        {/* Center Rail - Infinite Feed */}
        <main className="lg:col-span-6">
          <InfiniteArticleFeed
            initialArticles={initialFeed.articles}
            initialCursor={initialFeed.nextCursor}
          />
        </main>

        {/* Right Rail - Trending Promo */}
        <aside className="lg:col-span-3 space-y-6">
          <TrendingPromoRail />
          <AdBanner slotName="homepage-sidebar" />
        </aside>
      </div>
    </div>
  );
}
