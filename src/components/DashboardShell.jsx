"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  MessageCircle,
  Briefcase,
  Mail,
  ScanSearch,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { planBadgeLabel } from "@/lib/checkPlan";
import toast from "react-hot-toast";

function planBadgeClasses(plan) {
  if (plan === "lifetime")
    return "bg-violet-500/20 text-violet-200 ring-violet-500/40";
  if (plan === "pro")
    return "bg-sky-500/20 text-sky-200 ring-sky-500/40";
  return "bg-slate-500/20 text-slate-200 ring-slate-500/40";
}

/** @typedef {{ resumeCount: number; resumeLimit: number | null; aiUsed?: number; aiLimit?: number }} UsageSummary */

const shellNav = [
  { kind: "link", href: "/dashboard", label: "My dashboard", icon: LayoutDashboard },
  {
    kind: "link",
    href: "/dashboard/resume/agent",
    label: "AI resume agent",
    icon: Sparkles,
    badge: "New",
  },
  {
    kind: "soon",
    label: "AI interview",
    icon: MessageCircle,
    badge: "New",
  },
  { kind: "soon", label: "Job search", icon: Briefcase },
  { kind: "link", href: "/dashboard/cover-letter", label: "Cover letters", icon: Mail },
  {
    kind: "link",
    href: "/dashboard/keyword-scanner",
    label: "Keyword scanner",
    icon: ScanSearch,
  },
  { kind: "link", href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/**
 * @param {{
 *   user: import("@supabase/supabase-js").User;
 *   plan: string;
 *   headerTitle?: string;
 *   children: React.ReactNode;
 *   onLogout: () => Promise<void>;
 *   onNewResumeClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
 *   usageSummary?: UsageSummary | null;
 *   onUpgradeClick?: (() => void) | null;
 *   showUpgradeButton?: boolean;
 * }} props
 */
export function DashboardShell({
  user,
  plan,
  headerTitle = "Dashboard",
  children,
  onLogout,
  onNewResumeClick,
  usageSummary = null,
  onUpgradeClick = null,
  showUpgradeButton = false,
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("zoru_doc_picker_dismissed");
      }
      await onLogout();
    } finally {
      setLogoutLoading(false);
    }
  }

  function navActive(href) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  const resumePct =
    usageSummary && usageSummary.resumeLimit != null && usageSummary.resumeLimit > 0
      ? Math.min(
          100,
          (usageSummary.resumeCount / usageSummary.resumeLimit) * 100
        )
      : usageSummary?.resumeLimit == null
        ? 100
        : 0;

  const aiLimit = usageSummary?.aiLimit ?? 0;
  const aiUsed = usageSummary?.aiUsed ?? 0;
  const aiPct =
    aiLimit > 0 ? Math.min(100, (aiUsed / aiLimit) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-slate-100">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#30363d] bg-[#161b22] transition-transform duration-200 ease-out md:relative md:z-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-[#30363d] px-3">
          <Link
            href="/"
            className="truncate text-base font-bold tracking-tight text-white"
          >
            Zoru
          </Link>
          <div className="flex shrink-0 items-center gap-0.5">
            <ThemeToggle />
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <Link
            href="/dashboard/resume/new"
            onClick={(e) => {
              onNewResumeClick?.(e);
              setSidebarOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Create new resume
          </Link>
        </div>

        <div className="border-b border-[#30363d] px-3 py-3">
          <p className="truncate px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Signed in
          </p>
          <p className="mt-1 truncate px-2 text-sm font-medium text-slate-200">
            {user.email}
          </p>
          <div className="mt-2 px-2">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${planBadgeClasses(plan)}`}
            >
              {planBadgeLabel(plan)}
            </span>
          </div>
        </div>

        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2"
          aria-label="Dashboard"
        >
          {shellNav.map((item) => {
            if (item.kind === "soon") {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    toast("Coming soon.", { icon: "✨" });
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 transition hover:bg-white/5 hover:text-slate-300"
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            }
            const Icon = item.icon;
            const active = navActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-3 rounded-lg bg-sky-500/15 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-sky-300 ring-1 ring-sky-500/30"
                    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {usageSummary ? (
          <div className="border-t border-[#30363d] px-3 py-3 space-y-3">
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Resumes</span>
                <span className="text-slate-400">
                  {usageSummary.resumeCount}/
                  {usageSummary.resumeLimit == null
                    ? "∞"
                    : usageSummary.resumeLimit}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#30363d]">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${resumePct}%` }}
                />
              </div>
            </div>
            {aiLimit > 0 ? (
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>AI generations</span>
                  <span className="text-slate-400">
                    {aiUsed}/{aiLimit}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#30363d]">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{ width: `${aiPct}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto space-y-2 border-t border-[#30363d] p-3">
          {showUpgradeButton && onUpgradeClick ? (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="flex w-full items-center justify-center rounded-lg border border-sky-500/50 bg-sky-500/10 py-2.5 text-xs font-bold uppercase tracking-wide text-sky-300 transition hover:bg-sky-500/20"
            >
              Upgrade
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-60"
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

      <div className="flex min-w-0 flex-1 flex-col bg-[#0d1117]">
        <header className="flex h-14 items-center gap-3 border-b border-[#30363d] bg-[#161b22] px-4 md:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
            {headerTitle}
          </span>
          <ThemeToggle />
        </header>

        {children}
      </div>
    </div>
  );
}
