import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { extractPlainText } from "./TiptapRenderer";
import { getLabelColor } from "@/lib/constants/theme";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";

interface ArticleCardProps {
  title: string;
  slug: string;
  category: { name: string; slug: string };
  publishedAt: Date | null;
  coverImageUrl: string | null;
  author: { name: string | null };
  content?: unknown;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadingTime(content: unknown): string {
  const words = extractPlainText(content, 10000).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

export default function ArticleCard({
  title,
  slug,
  category,
  publishedAt,
  coverImageUrl,
  author,
  content,
}: ArticleCardProps) {
  const readTime = content ? estimateReadingTime(content) : "";

  return (
    <Link
      href={`/article/${slug}`}
      className="group flex flex-col sm:flex-row gap-4 border-b border-structural pb-5 last:border-0 last:pb-0"
    >
      <div className="relative aspect-[4/3] sm:w-48 shrink-0 overflow-hidden rounded border border-slate-100 bg-slate-50">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ThumbnailPlaceholder className="w-full h-full" />
        )}
      </div>

      <div className="flex flex-col flex-1 py-1">
        <span className={`text-[11px] md:text-[12px] font-bold uppercase mb-1.5 ${getLabelColor(category.name)}`}>
          {category.name}
        </span>
        <h3 className="text-[16px] md:text-[18px] font-bold leading-snug text-slate-900 transition group-hover:text-blue-600 mb-2">
          {title}
        </h3>
        {!!content && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {extractPlainText(content, 150)}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 text-xs text-text-secondary font-medium uppercase">
          <span>{author.name ?? "Desk"}</span>
          <span className="text-surface-border">|</span>
          {publishedAt && <span>{formatDate(publishedAt)}</span>}
          {readTime && (
            <>
              <span className="text-surface-border">|</span>
              <span className="flex items-center gap-1">
                <Clock3 size={12} />
                {readTime}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
