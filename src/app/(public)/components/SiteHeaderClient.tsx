"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-white border-b border-structural shadow-sm font-sans">
      {/* Super Top Bar - Date & Social */}
      <div className="bg-secondary-dark text-secondary-light border-b border-secondary hidden md:block">
        <div className="max-w-[1280px] mx-auto px-4 h-8 flex items-center justify-between text-[11px] font-condensed tracking-widest uppercase font-bold">
          <div>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition">Facebook</Link>
            <Link href="#" className="hover:text-white transition">Twitter</Link>
            <Link href="#" className="hover:text-white transition">YouTube</Link>
          </div>
        </div>
      </div>

      {/* Top Bar - Branding & Search */}
      <div className="bg-primary text-white">
        <div className="max-w-[1280px] mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex flex-col items-start leading-none group">
            <span className="text-[10px] font-condensed font-bold tracking-widest text-primary-light uppercase mb-1">
              The Daily Truth
            </span>
            <span className="text-4xl font-serif font-black tracking-tight group-hover:text-primary-light transition-colors">
              Bharat Sentinel
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <form action="/search" method="get" className="relative">
              <input 
                type="search" 
                name="q" 
                placeholder="Search news..." 
                className="bg-primary-dark text-white placeholder-primary-light/70 px-4 py-2 rounded-sm border border-primary-dark focus:border-white focus:outline-none text-sm transition-colors w-64"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-light hover:text-white">
                <Search size={16} />
              </button>
            </form>
            <Link href="/login" className="text-xs font-condensed font-bold uppercase tracking-widest border border-primary-light px-4 py-2 hover:bg-white hover:text-primary transition-colors">
              Staff Login
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="md:hidden text-white hover:text-primary-light transition-colors"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Main Navigation (Desktop) */}
      <div className="hidden md:block bg-secondary text-white">
        <div className="max-w-[1280px] mx-auto px-4 h-12 flex items-center justify-between">
          <nav className="flex items-center h-full space-x-1 overflow-x-auto scrollbar-hide">
            <HeaderLink href="/" active={pathname === "/"}>HOME</HeaderLink>
            {categories.map((category) => (
              <HeaderLink
                key={category.id}
                href={`/category/${category.slug}`}
                active={pathname === `/category/${category.slug}`}
              >
                {category.name.toUpperCase()}
              </HeaderLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {open && (
        <div className="md:hidden bg-secondary text-white border-t border-secondary-dark">
          <div className="p-4 space-y-4">
            <form action="/search" method="get" className="relative">
              <input 
                type="search" 
                name="q" 
                placeholder="Search news..." 
                className="w-full bg-secondary-dark text-white placeholder-secondary-light/70 px-4 py-2 border border-secondary-dark focus:border-white focus:outline-none text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-light">
                <Search size={18} />
              </button>
            </form>
            <nav className="grid grid-cols-2 gap-2">
              <HeaderLink href="/" active={pathname === "/"}>HOME</HeaderLink>
              {categories.map((category) => (
                <HeaderLink
                  key={category.id}
                  href={`/category/${category.slug}`}
                  active={pathname === `/category/${category.slug}`}
                >
                  {category.name.toUpperCase()}
                </HeaderLink>
              ))}
              <Link href="/login" className="px-3 py-2 text-sm font-condensed font-bold uppercase tracking-widest text-secondary-light hover:text-white">
                STAFF LOGIN
              </Link>
            </nav>
          </div>
        </div>
      )}
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
      className={`h-full flex items-center px-4 text-xs font-condensed font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${
        active
          ? "bg-secondary-dark text-white"
          : "text-secondary-light hover:bg-secondary-dark hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
