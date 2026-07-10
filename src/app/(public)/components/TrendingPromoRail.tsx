import Image from "next/image";
import Link from "next/link";
import { getTrendingPromoStories } from "@/lib/services/public-queries";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";
import { getBadgeColor } from "@/lib/constants/theme";

export async function TrendingPromoRail() {
  const articles = await getTrendingPromoStories(4);

  if (!articles || articles.length === 0) return null;

  return (
    <div className="sticky top-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <h2 className="text-[18px] font-bold text-slate-900">Trending Now</h2>
      </div>
      <div className="flex flex-col gap-0 divide-y divide-slate-100 bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        {articles.map((article) => (
          <article key={article.id} className="group relative p-4 hover:bg-slate-50 transition-colors">
            <Link href={`/article/${article.slug}`} className="flex gap-4">
              <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded border border-slate-100 bg-slate-50">
                {article.coverImageUrl ? (
                  <Image
                    src={article.coverImageUrl}
                    alt={article.title}
                    fill
                    sizes="64px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <ThumbnailPlaceholder className="w-full h-full" />
                )}
              </div>
              <div className="flex flex-col flex-1">
                <span className={`inline-block self-start text-[10px] font-bold uppercase mb-1.5 px-2 py-0.5 rounded-sm ${getBadgeColor("Trending")}`}>
                  Trending
                </span>
                <h3 className="text-[13px] font-medium text-slate-800 leading-snug group-hover:text-amber-600 transition-colors line-clamp-3">
                  {article.title}
                </h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
