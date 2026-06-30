import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Globe, Mail, Newspaper, Radio, Sparkles } from "lucide-react";

export default async function SiteFooter() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 10,
  });

  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/60 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
              <Newspaper size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Independent Desk
              </p>
              <p className="text-2xl font-black tracking-tight text-white">
                NewsPortal
              </p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            Built for faster scanning, deeper reading, and cleaner collaboration between reporters, editors, and the publishing desk.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span className="rounded-full border border-slate-800 px-3 py-2">Breaking</span>
            <span className="rounded-full border border-slate-800 px-3 py-2">Explainers</span>
            <span className="rounded-full border border-slate-800 px-3 py-2">Editorial workflow</span>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
            Explore
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/" className="rounded-2xl px-3 py-2 text-slate-300 transition hover:bg-slate-900 hover:text-white">
              Homepage
            </Link>
            <Link href="/search" className="rounded-2xl px-3 py-2 text-slate-300 transition hover:bg-slate-900 hover:text-white">
              Search
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-2xl px-3 py-2 text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
            Reader Features
          </h3>
          <div className="space-y-3 text-sm text-slate-400">
            <Feature icon={Sparkles} text="Share-ready article pages with clean metadata and richer story presentation." />
            <Feature icon={Radio} text="Live signal sections surface newer coverage and category-led discovery." />
            <Feature icon={Mail} text="Newsletter slot reserved for future mailing integration." />
            <Feature icon={Globe} text="Public newsroom and internal desk now share a more cohesive visual system." />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {year} NewsPortal. Built with Next.js, Prisma, and PostgreSQL.</p>
          <Link href="/login" className="font-semibold text-slate-400 transition hover:text-white">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: typeof Sparkles;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-slate-300">
        <Icon size={14} />
      </div>
      <p className="leading-6">{text}</p>
    </div>
  );
}
