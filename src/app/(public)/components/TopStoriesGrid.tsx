import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";
import { getLabelColor } from "@/lib/constants/theme";

interface ArticleProps {
  id: string;
  title: string;
  slug: string;
  category: { name: string; slug: string };
  publishedAt: Date | null;
  coverImageUrl: string | null;
}

export function TopStoriesGrid({ articles }: { articles: ArticleProps[] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="flex flex-col gap-0 divide-y divide-slate-100">
      {articles.map((article) => (
        <article key={article.id} className="group relative bg-white p-4 hover:bg-slate-50 transition-colors">
          <div className="flex gap-4">
            <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded border border-slate-100 bg-slate-50">
              {article.coverImageUrl ? (
                <Image
                  src={article.coverImageUrl}
                  alt={article.title}
                  fill
                  sizes="80px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <ThumbnailPlaceholder className="w-full h-full" />
              )}
            </div>
            <div className="flex flex-col justify-center flex-1">
              <span className={`text-[11px] md:text-[12px] font-bold uppercase mb-1 ${getLabelColor(article.category.name)}`}>
                {article.category.name}
              </span>
              <h3 className="text-[14px] md:text-[16px] font-medium text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                <Link href={`/article/${article.slug}`} className="before:absolute before:inset-0">
                  {article.title}
                </Link>
              </h3>
              <div className="text-[12px] text-slate-500 mt-1.5 font-medium">
                {article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : ''}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
