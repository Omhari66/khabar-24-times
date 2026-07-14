"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, X, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { SOCIAL_LINKS } from "@/lib/constants";

type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  children?: SubCategory[];
};

export default function SiteHeaderClient({
  categories,
}: {
  categories: Category[];
}) {
  const pathname = usePathname();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Side drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth === 0) {
      setImgError(true);
    }
  }, [session?.user?.image]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
    setExpandedCategory(null);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [drawerOpen]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-structural shadow-sm font-sans">
        {/* Super Top Bar - Date & Social */}
        <div className="bg-secondary-dark text-secondary-light border-b border-secondary hidden md:block">
          <div className="max-w-[1280px] mx-auto px-4 h-8 flex items-center justify-between text-[11px] font-condensed tracking-widest uppercase font-bold">
            <div>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div className="flex gap-4">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Facebook</a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">X / Twitter</a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Instagram</a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">YouTube</a>
            </div>
          </div>
        </div>

        {/* Top Bar - Branding & Search */}
        <div className="bg-primary text-white">
          <div className="max-w-[1280px] mx-auto px-4 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <Image
                src="/logo.png"
                alt="Khabar 24 Times Logo"
                width={60}
                height={60}
                className="logo-spin rounded-full w-10 h-10 sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px]"
                priority
              />
              <div className="flex flex-col items-start leading-none">
                <span className="hidden sm:flex text-[10px] font-condensed font-bold tracking-widest text-primary-light uppercase mb-1 items-center">
                  <span className="logo-live-dot" aria-hidden="true" />
                  The Daily Truth
                </span>
                <span className="text-xl sm:text-2xl md:text-4xl font-serif font-black tracking-tight logo-text flex items-center">
                  Khabar
                  <span className="text-3xl sm:text-4xl md:text-5xl text-primary bg-white px-1.5 sm:px-2 py-0.5 mx-1.5 sm:mx-2 rounded-sm transform -skew-x-12 inline-block leading-none shadow-md font-sans font-black">24</span>
                  Times
                </span>
              </div>
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
              {status === "authenticated" && session?.user ? (
                <Link href="/login" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {session.user.image && !imgError ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={imgRef}
                        src={session.user.image}
                        alt="Profile"
                        className="h-8 w-8 rounded-full border border-primary-light object-cover"
                        onError={() => setImgError(true)}
                      />
                    </>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary font-bold">
                      {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-sm font-semibold whitespace-nowrap">{session.user.name?.split(" ")[0] || "Profile"}</span>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">Login or Signup</span>
                </Link>
              )}
            </div>

            {/* Mobile: search + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileSearchOpen((v) => !v)}
                className="text-white hover:text-primary-light transition-colors p-1"
              >
                <Search size={22} />
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {mobileSearchOpen && (
            <div className="md:hidden px-4 pb-3">
              <form action="/search" method="get" className="relative">
                <input
                  type="search"
                  name="q"
                  placeholder="Search news..."
                  className="w-full bg-primary-dark text-white placeholder-primary-light/70 px-4 py-2 rounded-sm border border-primary-dark focus:border-white focus:outline-none text-sm"
                  autoFocus
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-light hover:text-white">
                  <Search size={16} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Main Navigation Bar (Dark) ── */}
        <div className="bg-secondary text-white">
          <div className="max-w-[1280px] mx-auto px-4 h-12 flex items-center gap-2">

            {/* ≡ Hamburger Button — LEFT side */}
            <button
              type="button"
              id="category-drawer-btn"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="Browse all categories"
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary-dark hover:bg-primary transition-colors shrink-0 group"
            >
              <Menu size={18} className="text-white" />
              <span className="text-xs font-condensed font-bold tracking-widest uppercase text-secondary-light group-hover:text-white hidden sm:inline">
                Categories
              </span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-secondary-dark mx-1 shrink-0" />

            {/* Scrollable category links */}
            <nav className="flex items-center h-full space-x-1 overflow-x-auto scrollbar-hide flex-1">
              <HeaderLink href="/" active={pathname === "/"}>HOME</HeaderLink>
              {categories.map((category) => (
                <HeaderLink
                  key={category.id}
                  href={`/category/${category.slug}`}
                  active={
                    pathname === `/category/${category.slug}` ||
                    (category.children?.some((c) => pathname === `/category/${c.slug}`) ?? false)
                  }
                >
                  {category.name.toUpperCase()}
                </HeaderLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Side Drawer Overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            className="relative z-10 flex flex-col w-[320px] max-w-[85vw] h-full bg-white shadow-2xl animate-slide-in-left"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-primary text-white shrink-0">
              <div className="flex items-center gap-2">
                <Menu size={18} />
                <span className="font-condensed font-bold tracking-widest uppercase text-sm">All Categories</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-primary-light hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Body */}
            <nav className="flex-1 overflow-y-auto">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center px-5 py-3.5 text-sm font-semibold border-b border-gray-100 transition-colors ${
                  pathname === "/"
                    ? "text-primary bg-primary/5 border-l-4 border-l-primary"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                }`}
              >
                🏠 Home
              </Link>

              {/* Categories */}
              {categories.map((category) => {
                const hasChildren = category.children && category.children.length > 0;
                const isExpanded = expandedCategory === category.id;
                const isActive =
                  pathname === `/category/${category.slug}` ||
                  category.children?.some((c) => pathname === `/category/${c.slug}`);

                return (
                  <div key={category.id}>
                    {/* Category row */}
                    <div
                      className={`flex items-center border-b border-gray-100 transition-colors ${
                        isActive ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                      }`}
                    >
                      <Link
                        href={`/category/${category.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex-1 flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors ${
                          isActive ? "text-primary" : "text-gray-700 hover:text-primary"
                        }`}
                      >
                        {category.name}
                        {hasChildren && (
                          <span className="ml-auto mr-2 text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {category.children!.length}
                          </span>
                        )}
                      </Link>

                      {/* Expand arrow — only if has subcategories */}
                      {hasChildren && (
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          className="px-4 py-3.5 text-gray-400 hover:text-primary hover:bg-gray-50 transition-colors"
                          aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                        >
                          <ChevronRight
                            size={17}
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-90 text-primary" : ""}`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Subcategories accordion */}
                    {hasChildren && isExpanded && (
                      <div className="bg-gray-50 border-b border-gray-100">
                        {category.children!.map((child) => {
                          const childActive = pathname === `/category/${child.slug}`;
                          return (
                            <Link
                              key={child.id}
                              href={`/category/${child.slug}`}
                              onClick={() => setDrawerOpen(false)}
                              className={`flex items-center gap-3 pl-10 pr-5 py-3 text-sm border-b border-gray-100 last:border-0 transition-colors ${
                                childActive
                                  ? "text-primary font-semibold bg-primary/5"
                                  : "text-gray-600 hover:text-primary hover:bg-white"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${childActive ? "bg-primary" : "bg-gray-300"}`} />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Login / Profile */}
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                👤 Login / Sign Up
              </Link>
            </nav>

            {/* Drawer Footer */}
            <div className="shrink-0 px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-center">
              Khabar 24 Times — The Daily Truth
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.22s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </>
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
