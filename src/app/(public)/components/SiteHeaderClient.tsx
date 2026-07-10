"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

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
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth === 0) {
      setImgError(true);
    }
  }, [session?.user?.image]);

  useEffect(() => {
    setOpen(false);
    setExpandedMobileCategory(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm font-sans">
      {/* Super Top Bar */}
      <div className="bg-[#8b0000] text-white/80 hidden md:block">
        <div className="max-w-[1280px] mx-auto px-4 h-8 flex items-center justify-between text-[11px] tracking-wider uppercase font-medium">
          <div>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="flex gap-5 items-center">
            <Link href="#" className="hover:text-white transition">Facebook</Link>
            <Link href="#" className="hover:text-white transition">Twitter</Link>
            <Link href="#" className="hover:text-white transition">YouTube</Link>
          </div>
        </div>
      </div>

      {/* Branding Bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Khabar 24 Times Logo"
              width={54}
              height={54}
              className="rounded-full w-10 h-10 sm:w-[48px] sm:h-[48px]"
              priority
            />
            <div className="flex flex-col leading-none">
              <span className="hidden sm:block text-[10px] tracking-widest uppercase text-gray-500 mb-0.5">The Daily Truth</span>
              <span className="text-xl sm:text-2xl md:text-[28px] font-black tracking-tight text-[#8b0000] flex items-center">
                Khabar
                <span className="text-[#8b0000] bg-[#fff0f0] border border-[#f5c6c6] px-1.5 mx-1.5 rounded font-black text-2xl md:text-3xl">24</span>
                Times
              </span>
            </div>
          </Link>

          {/* Search + User (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <form action="/search" method="get" className="relative">
              <input
                type="search"
                name="q"
                placeholder="Search news..."
                className="bg-gray-50 text-gray-800 placeholder-gray-400 px-4 py-2 rounded-full border border-gray-200 focus:border-[#8b0000] focus:outline-none focus:ring-2 focus:ring-[#8b0000]/10 text-sm transition-all w-56"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8b0000]">
                <Search size={15} />
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
                      className="h-8 w-8 rounded-full border-2 border-[#8b0000]/20 object-cover"
                      onError={() => setImgError(true)}
                    />
                  </>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8b0000] text-white font-bold text-sm">
                    {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700">{session.user.name?.split(" ")[0] || "Profile"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#8b0000] hover:bg-[#fff0f0] px-3 py-1.5 rounded-full border border-[#8b0000]/20 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-[#8b0000] hover:bg-[#fff0f0] p-2 rounded-full transition-colors"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* ── Desktop Category Nav Bar ── */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4">
          <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide" style={{ height: "48px" }}>
            {/* HOME pill */}
            <NavPill href="/" active={pathname === "/"}>
              होम / Home
            </NavPill>

            {categories.map((category) =>
              category.children && category.children.length > 0 ? (
                <DropdownNavItem key={category.id} category={category} pathname={pathname} />
              ) : (
                <NavPill
                  key={category.id}
                  href={`/category/${category.slug}`}
                  active={pathname === `/category/${category.slug}`}
                >
                  {category.name}
                </NavPill>
              )
            )}
          </nav>
        </div>
      </div>

      {/* ── Mobile Nav Drawer ── */}
      {open && (
        <div className="md:hidden absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          {/* Mobile Search */}
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <form action="/search" method="get" className="relative">
              <input
                type="search"
                name="q"
                placeholder="Search news..."
                className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 px-4 py-2.5 rounded-full border border-gray-200 focus:border-[#8b0000] focus:outline-none text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Mobile Category List */}
          <nav className="max-h-[70vh] overflow-y-auto">
            <Link
              href="/"
              className={`flex items-center px-5 py-3.5 text-sm font-semibold border-b border-gray-100 transition-colors ${
                pathname === "/" ? "text-[#8b0000] bg-[#fff5f5]" : "text-gray-700 hover:bg-gray-50 hover:text-[#8b0000]"
              }`}
            >
              होम / Home
            </Link>

            {categories.map((category) => {
              const hasChildren = category.children && category.children.length > 0;
              const isExpanded = expandedMobileCategory === category.id;
              const isActive =
                pathname === `/category/${category.slug}` ||
                category.children?.some((c) => pathname === `/category/${c.slug}`);

              return (
                <div key={category.id}>
                  <div className="flex items-center border-b border-gray-100">
                    <Link
                      href={`/category/${category.slug}`}
                      className={`flex-1 px-5 py-3.5 text-sm font-semibold transition-colors ${
                        isActive ? "text-[#8b0000] bg-[#fff5f5]" : "text-gray-700 hover:bg-gray-50 hover:text-[#8b0000]"
                      }`}
                    >
                      {category.name}
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={() => setExpandedMobileCategory(isExpanded ? null : category.id)}
                        className="px-4 py-3.5 text-[#8b0000] hover:bg-[#fff5f5] transition-colors"
                      >
                        <ChevronRight
                          size={18}
                          className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Mobile subcategories */}
                  {hasChildren && isExpanded && (
                    <div className="bg-[#fff9f9]">
                      {category.children!.map((child) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className={`flex items-center gap-2 pl-10 pr-5 py-3 text-sm border-b border-[#f5e5e5] transition-colors ${
                            pathname === `/category/${child.slug}`
                              ? "text-[#8b0000] font-semibold bg-[#fff0f0]"
                              : "text-gray-600 hover:text-[#8b0000] hover:bg-[#fff0f0]"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8b0000]/40 shrink-0" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Login link */}
            <Link
              href="/login"
              className="flex items-center px-5 py-3.5 text-sm font-semibold text-[#8b0000] border-b border-gray-100 hover:bg-[#fff5f5] transition-colors"
            >
              Login / Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

// ── Desktop: plain pill link ──
function NavPill({
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
      className={`flex items-center whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
        active
          ? "bg-[#8b0000] text-white shadow-sm"
          : "text-gray-600 hover:text-[#8b0000] hover:bg-[#fff0f0]"
      }`}
    >
      {children}
    </Link>
  );
}

// ── Desktop: pill with hover dropdown ──
function DropdownNavItem({
  category,
  pathname,
}: {
  category: Category;
  pathname: string;
}) {
  const isActive =
    pathname === `/category/${category.slug}` ||
    category.children?.some((c) => pathname === `/category/${c.slug}`);

  return (
    <div className="relative flex items-center group h-full">
      <Link
        href={`/category/${category.slug}`}
        className={`flex items-center gap-1 whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
          isActive
            ? "bg-[#8b0000] text-white shadow-sm"
            : "text-gray-600 hover:text-[#8b0000] hover:bg-[#fff0f0]"
        }`}
      >
        {category.name}
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 group-hover:rotate-180 ${isActive ? "text-white" : "text-gray-400"}`}
        />
      </Link>

      {/* Dropdown */}
      <div className="absolute top-[calc(100%+6px)] left-0 z-50 hidden group-hover:block min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
        {/* Arrow tip */}
        <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45" />
        <div className="relative">
          {/* Category header link */}
          <Link
            href={`/category/${category.slug}`}
            className="block px-4 py-2.5 text-xs font-bold text-[#8b0000] uppercase tracking-wider bg-[#fff5f5] border-b border-gray-100"
          >
            All {category.name} →
          </Link>
          {category.children!.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm border-b border-gray-50 last:border-0 transition-colors ${
                pathname === `/category/${child.slug}`
                  ? "bg-[#fff0f0] text-[#8b0000] font-semibold"
                  : "text-gray-700 hover:bg-[#fff5f5] hover:text-[#8b0000]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b0000]/50 shrink-0" />
              {child.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
