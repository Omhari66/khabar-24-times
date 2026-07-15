"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const links = [
    { href: "/dashboard/editor", label: "Review Queue" },
    ...(role === "ADMIN" ? [{ href: "/dashboard/admin", label: "User Management" }] : []),
    ...(role === "ADMIN" ? [{ href: "/dashboard/admin/reporters", label: "🪪 Reporter Cards" }] : []),
    { href: "/dashboard/admin/homepage", label: "Homepage Builder" },
    { href: "/dashboard/admin/kanban", label: "Kanban Board" },
    { href: "/dashboard/admin/planning", label: "Planning Board" },
    ...(role === "ADMIN" ? [{ href: "/dashboard/admin/categories", label: "Categories" }] : []),
    ...(role === "ADMIN" ? [{ href: "/dashboard/admin/advertisements", label: "Advertisements" }] : []),
    ...(role === "ADMIN" ? [{ href: "/dashboard/admin/ai-chat", label: "✨ AI सहायक" }] : []),
  ];

  return (
    <div className="flex flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 mb-8">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-semibold pb-3 transition-colors ${
              isActive
                ? "border-b-2 border-blue-500 -mb-3.5 text-blue-600 dark:text-blue-400 font-bold"
                : "text-slate-500 hover:text-slate-955 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="text-sm font-semibold text-slate-500 hover:text-slate-955 dark:text-slate-400 dark:hover:text-white pb-3 ml-auto"
      >
        View Website ↗
      </Link>
    </div>
  );
}
