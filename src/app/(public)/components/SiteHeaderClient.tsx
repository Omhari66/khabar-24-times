"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Newspaper, Search, X } from "lucide-react";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function SiteHeaderClient({
  categories,
}: {
  categories: Category[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-[rgba(247,243,236,0.82)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 lg:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
                <Newspaper size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Live Desk
                </p>
                <p className="text-xl font-black tracking-tight text-slate-950">
                  NewsPortal
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <nav
              aria-label="Primary"
              className="glass-panel flex items-center gap-1 rounded-full border border-white/60 px-2 py-2"
            >
              <HeaderLink href="/" active={pathname === "/"}>
                Home
              </HeaderLink>
              {categories.map((category) => (
                <HeaderLink
                  key={category.id}
                  href={`/category/${category.slug}`}
                  active={pathname === `/category/${category.slug}`}
                >
                  {category.name}
                </HeaderLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <form
              action="/search"
              method="get"
              role="search"
              className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-2 shadow-sm md:flex"
            >
              <Search size={15} className="text-slate-400" />
              <input
                type="search"
                name="q"
                placeholder="Search stories, beats, sections"
                className="w-56 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </form>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Staff Login
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/60 py-3 text-xs text-slate-500">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold uppercase tracking-[0.2em] text-emerald-800">
              New Format
            </span>
            <p className="truncate">
              A cleaner newsroom surface for breaking coverage, longform reads, and internal publishing.
            </p>
          </div>
          <Link href="/search" className="font-semibold text-slate-700 transition hover:text-slate-950 md:hidden">
            Search
          </Link>
        </div>

        {open && (
          <div className="glass-panel mb-4 rounded-3xl border border-white/60 p-4 lg:hidden">
            <div className="mb-4">
              <form
                action="/search"
                method="get"
                role="search"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2"
              >
                <Search size={15} className="text-slate-400" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search the newsroom"
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </form>
            </div>
            <nav className="grid grid-cols-2 gap-2">
              <HeaderLink href="/" active={pathname === "/"}>
                Home
              </HeaderLink>
              {categories.map((category) => (
                <HeaderLink
                  key={category.id}
                  href={`/category/${category.slug}`}
                  active={pathname === `/category/${category.slug}`}
                >
                  {category.name}
                </HeaderLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function HeaderLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-white hover:text-slate-950"
      }`}
    >
      {children}
    </Link>
  );
}
