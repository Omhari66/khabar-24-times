import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { extractPlainText } from "./TiptapRenderer";

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
      <div className="relative aspect-[4/3] sm:w-48 shrink-0 overflow-hidden bg-surface-muted rounded-sm">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-surface-border" />
        )}
      </div>

      <div className="flex flex-col flex-1 py-1">
        <span className="text-primary font-condensed font-bold uppercase tracking-widest text-xs mb-1">
          {category.name}
        </span>
        <h3 className="text-xl font-serif font-bold leading-snug text-text-primary transition group-hover:text-primary mb-2">
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
