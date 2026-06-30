import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock3 } from "lucide-react";

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

  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadingTime(content: unknown): string {
  if (!content || typeof content !== "object") return "";

  const parts: string[] = [];

  function walk(node: Record<string, unknown>) {
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        if (child && typeof child === "object") walk(child as Record<string, unknown>);
      }
    }
  }

  walk(content as Record<string, unknown>);
  const wordCount = parts.join(" ").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));

  return `${minutes} min read`;
}

const GRADIENTS = [
  "from-emerald-700 via-teal-700 to-slate-900",
  "from-amber-600 via-orange-600 to-slate-950",
  "from-cyan-700 via-sky-700 to-slate-950",
  "from-rose-700 via-orange-700 to-slate-950",
  "from-slate-800 via-teal-800 to-black",
  "from-indigo-700 via-slate-800 to-black",
];

function placeholderGradient(categoryName: string): string {
  const index =
    categoryName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    GRADIENTS.length;

  return GRADIENTS[index];
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
  const gradient = placeholderGradient(category.name);

  return (
    <Link
      href={`/article/${slug}`}
      className="group glass-panel-strong overflow-hidden rounded-[30px] border border-white/70 transition duration-300 hover:-translate-y-1 hover:bg-white"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-950">
            {category.name}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-black leading-7 text-slate-950 transition group-hover:text-emerald-800">
          {title}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {author.name ?? "NewsPortal Desk"}
          </span>
          {readTime && (
            <span className="flex items-center gap-1.5">
              <Clock3 size={12} />
              {readTime}
            </span>
          )}
          {publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {formatDate(publishedAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
