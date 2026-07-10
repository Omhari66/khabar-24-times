"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();

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
                {session.user.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={session.user.image} alt="Profile" className="h-8 w-8 rounded-full border border-primary-light object-cover" />
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
                LOGIN OR SIGNUP
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
