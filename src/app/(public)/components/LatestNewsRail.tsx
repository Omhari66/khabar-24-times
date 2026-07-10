import Link from "next/link";
import { getLatestNews } from "@/lib/services/public-queries";
import { formatDistanceToNow } from "date-fns";
import { getLabelColor } from "@/lib/constants/theme";

export async function LatestNewsRail() {
  const articles = await getLatestNews(15);

  return (
    <div className="sticky top-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <h2 className="text-[18px] font-bold text-slate-900">Latest News</h2>
      </div>
      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <article key={article.id} className="group border-b border-slate-100 pb-4 last:border-0">
            <Link href={`/article/${article.slug}`} className="block">
              <span className={`text-[11px] font-bold uppercase mb-1 block ${getLabelColor(article.category.name)}`}>
                {article.category.name}
              </span>
              <h3 className="text-[13px] font-medium text-slate-800 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                {article.title}
              </h3>
              <time className="text-[11px] text-slate-500 mt-1.5 block font-medium">
                {article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : ''}
              </time>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
