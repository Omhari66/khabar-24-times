import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Mail, MapPin, Phone } from "lucide-react";

export default async function SiteFooter() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 10,
  });

  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-secondary text-white font-sans border-t-8 border-primary">
      <div className="max-w-[1280px] mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-condensed font-bold tracking-widest text-primary-light uppercase">
              The Daily Truth
            </span>
            <span className="text-3xl font-serif font-black tracking-tight">
              Bharat Sentinel
            </span>
          </div>
          <p className="text-secondary-light text-sm leading-relaxed max-w-xs">
            A high-velocity, professional Indian news portal delivering authoritative, urgent, and deeply rooted journalistic integrity.
          </p>
          <div className="space-y-2 text-sm text-secondary-light">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-primary-light" />
              <span>New Delhi, India</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-primary-light" />
              <span>+91 11 2345 6789</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-primary-light" />
              <span>editor@bharatsentinel.in</span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div>
          <h3 className="text-lg font-condensed font-bold uppercase tracking-widest text-white mb-6 border-b border-secondary-light/20 pb-2">
            Sections
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <Link href="/" className="text-secondary-light hover:text-white transition-colors">
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-secondary-light hover:text-white transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-condensed font-bold uppercase tracking-widest text-white mb-6 border-b border-secondary-light/20 pb-2">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/search" className="text-secondary-light hover:text-white transition-colors">Search Archive</Link></li>
            <li><Link href="#" className="text-secondary-light hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="#" className="text-secondary-light hover:text-white transition-colors">Contact Editorial</Link></li>
            <li><Link href="#" className="text-secondary-light hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="text-secondary-light hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-condensed font-bold uppercase tracking-widest text-white mb-6 border-b border-secondary-light/20 pb-2">
            Newsletter
          </h3>
          <p className="text-secondary-light text-sm mb-4">
            Get the day&apos;s top headlines delivered straight to your inbox.
          </p>
          <form className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-secondary-dark text-white px-4 py-2 border border-secondary-dark focus:border-white focus:outline-none text-sm placeholder:text-secondary-light/50"
            />
            <button type="button" className="bg-primary text-white font-condensed font-bold uppercase tracking-widest py-2 hover:bg-primary-dark transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-secondary-dark bg-secondary-dark">
        <div className="max-w-[1280px] mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary-light font-condensed tracking-wider uppercase">
          <p>&copy; {year} Bharat Sentinel. Built on NewsPortal CMS.</p>
          <Link href="/login" className="hover:text-white transition-colors">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
