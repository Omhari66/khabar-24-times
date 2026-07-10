import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { getTrendingTags } from "@/lib/services/public-queries";

export async function TrendingTagsTicker() {
  const tags = await getTrendingTags(8);

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 py-2 overflow-x-auto">
      <div className="container mx-auto px-4 flex items-center whitespace-nowrap">
        <div className="flex items-center text-red-600 font-semibold text-sm mr-4 shrink-0">
          <TrendingUp className="w-4 h-4 mr-1.5" />
          TRENDING
        </div>
        <ul className="flex items-center gap-6 text-sm">
          {tags.map((tag) => (
            <li key={tag.id}>
              <Link
                href={`/tag/${tag.slug}`}
                className="text-slate-600 hover:text-red-600 transition-colors"
              >
                #{tag.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
