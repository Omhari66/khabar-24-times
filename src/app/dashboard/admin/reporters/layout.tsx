"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  History,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function ReporterSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      href: "/dashboard/admin/reporters",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/dashboard/admin/reporters/list",
      label: "Reporters List",
      icon: Users,
    },
    {
      href: "/dashboard/admin/reporters/generate",
      label: "Generate Card",
      icon: CreditCard,
    },
    {
      href: "/dashboard/admin/reporters/logs",
      label: "Verification Logs",
      icon: History,
    },
    {
      href: "/dashboard/admin/reporters/settings",
      label: "Settings",
      icon: Settings,
    },
    {
      href: "/dashboard/admin/reporters/profile",
      label: "Profile",
      icon: User,
    },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-2">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
            Reporter Card Center
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
          <hr className="border-slate-200 dark:border-slate-800 my-1" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col gap-2 w-64 shrink-0 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm h-fit sticky top-6">
        <div className="flex items-center gap-2 px-3 py-4 mb-3 border-b border-slate-100 dark:border-slate-800">
          <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
          <div>
            <h2 className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100">
              ID Card Center
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
              Management Portal
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10 transform translate-x-1"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Sub-Content */}
      <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        {children}
      </main>
    </div>
  );
}
