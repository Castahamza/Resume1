"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FilePenLine,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  ScanSearch,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { planBadgeLabel } from "@/lib/checkPlan";

const navItems = [
  { href: "/dashboard", label: "My Resumes", icon: FilePenLine },
  { href: "/dashboard/cover-letter", label: "Cover Letters", icon: Mail },
  {
    href: "/dashboard/keyword-scanner",
    label: "Keyword Scanner",
    icon: ScanSearch,
  },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function planBadgeClasses(plan) {
  if (plan === "lifetime")
    return "bg-violet-100 text-violet-900 ring-violet-200";
  if (plan === "pro") return "bg-blue-100 text-blue-900 ring-blue-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

/**
 * @param {{
 *   user: import("@supabase/supabase-js").User;
 *   plan: string;
 *   headerTitle?: string;
 *   children: React.ReactNode;
 *   onLogout: () => Promise<void>;
 * }} props
 */
export function DashboardShell({
  user,
  plan,
  headerTitle = "Dashboard",
  children,
  onLogout,
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await onLogout();
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out md:relative md:z-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-200 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-slate-900"
          >
            <BrandLogo size={36} />
            ResumeAI
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-3 py-3">
          <p className="truncate px-3 text-xs font-medium text-slate-500">
            Signed in
          </p>
          <p className="truncate px-3 text-sm font-semibold text-slate-900">
            {user.email}
          </p>
          <div className="mt-2 px-3">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1 ${planBadgeClasses(plan)}`}
            >
              {planBadgeLabel(plan)}
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Dashboard">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={label}
                href={href}
                className={
                  active
                    ? "flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-800"
                    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {logoutLoading ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
            ) : (
              <LogOut className="h-5 w-5 shrink-0" aria-hidden />
            )}
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-slate-900">{headerTitle}</span>
        </header>

        {children}
      </div>
    </div>
  );
}
