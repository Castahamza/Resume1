"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  LayoutGrid,
  List,
  Loader2,
  Trash2,
  Sparkles,
  Briefcase,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { ResumeThumbnail } from "@/components/templates/ResumeThumbnail";
import { getTemplateLabel } from "@/components/templates";
import { DashboardShell } from "@/components/DashboardShell";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  isPaidPlan,
  FREE_MAX_RESUMES,
  FREE_MONTHLY_AI_LIMIT,
} from "@/lib/checkPlan";
import { DashboardDocPickerOverlay } from "@/components/DashboardDocPickerOverlay";
import {
  DashboardSkeleton,
  ResumeListSkeleton,
} from "@/components/skeletons/DashboardSkeleton";
import { EmptyResumeIllustration } from "@/components/illustrations/EmptyStates";
import toast from "react-hot-toast";

const DOC_TABS = [
  { id: "resumes", label: "Resumes" },
  { id: "cover-letters", label: "Cover Letters" },
  { id: "resignation", label: "Resignation Letters" },
];

const FEATURE_CARDS = [
  {
    icon: Sparkles,
    title: "AI Resume Agent",
    desc: "Our most powerful AI resume tool",
    href: "/dashboard/resume/agent",
    accent: "#8b5cf6",
  },
  {
    icon: Briefcase,
    title: "Job Search",
    desc: "+2M jobs sourced from career pages",
    href: null,
    accent: "#0ea5e9",
  },
  {
    icon: MessageCircle,
    title: "AI Interview",
    desc: "A new way to practice interviewing",
    href: null,
    accent: "#10b981",
  },
];

const SORT_OPTIONS = [
  { id: "updated", label: "Updated" },
  { id: "created", label: "Created" },
  { id: "name", label: "Name" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("free");
  const [authLoading, setAuthLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumesError, setResumesError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [docPickerOpen, setDocPickerOpen] = useState(false);
  const [docTab, setDocTab] = useState("resumes");
  const [sortBy, setSortBy] = useState("created");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .maybeSingle();
      if (mounted) setPlan(profile?.plan ?? "free");

      setAuthLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      setUser(session.user);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;

    async function loadResumes() {
      setResumesLoading(true);
      setResumesError(null);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("resumes")
        .select("id, title, template, content, updated_at, created_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setResumesError(
          error.message || "Could not load resumes. Try refreshing the page."
        );
        setResumes([]);
      } else {
        setResumes(data ?? []);
      }
      setResumesLoading(false);
    }

    loadResumes();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (authLoading || !user || resumesLoading) return;
    try {
      if (!window.sessionStorage.getItem("zoru_doc_picker_dismissed")) {
        setDocPickerOpen(true);
      }
    } catch {
      setDocPickerOpen(true);
    }
  }, [authLoading, user, resumesLoading]);

  function dismissDocPicker() {
    try {
      window.sessionStorage.setItem("zoru_doc_picker_dismissed", "1");
    } catch {
      /* ignore */
    }
    setDocPickerOpen(false);
  }

  function pickerChooseResume() {
    if (!isPaidPlan(plan) && resumes.length >= FREE_MAX_RESUMES) {
      dismissDocPicker();
      setUpgradeOpen(true);
      return;
    }
    dismissDocPicker();
    router.push("/dashboard/resume/new");
  }

  function pickerChooseCoverLetter() {
    dismissDocPicker();
    router.push("/dashboard/cover-letter");
  }

  function pickerChooseResignation() {
    dismissDocPicker();
    toast("Resignation letters are coming soon.", { icon: "📄" });
  }

  async function handleDeleteResume(e, resumeId) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;

    setDeletingId(resumeId);
    setResumesError(null);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", resumeId)
        .eq("user_id", user.id);

      if (error) {
        setResumesError(
          error.message || "Could not delete resume. Please try again."
        );
        toast.error(error.message || "Could not delete resume.");
        return;
      }
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      toast.success("Resume deleted.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatResumeDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  }

  async function handleLogout() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function handleCreateClick(e) {
    if (
      !isPaidPlan(plan) &&
      resumes.length >= FREE_MAX_RESUMES
    ) {
      e.preventDefault();
      setUpgradeOpen(true);
    }
  }

  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }

  const displayName =
    user.user_metadata?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "there";

  const atResumeLimit =
    !isPaidPlan(plan) && resumes.length >= FREE_MAX_RESUMES;

  const pickerFirstName =
    user.user_metadata?.full_name?.trim()?.split?.(/\s+/)?.[0] || "";

  const sortedResumes = [...resumes].sort((a, b) => {
    if (sortBy === "name") {
      return (a.title || "").localeCompare(b.title || "");
    }
    if (sortBy === "created") {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
    return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
  });

  return (
    <DashboardShell
      user={user}
      plan={plan}
      onLogout={handleLogout}
      onNewResumeClick={handleCreateClick}
      usageSummary={{
        resumeCount: resumes.length,
        resumeLimit: isPaidPlan(plan) ? null : FREE_MAX_RESUMES,
        aiUsed: 0,
        aiLimit: isPaidPlan(plan) ? 0 : FREE_MONTHLY_AI_LIMIT,
      }}
      showUpgradeButton={!isPaidPlan(plan)}
      onUpgradeClick={() => setUpgradeOpen(true)}
    >
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Upgrade to create more resumes"
        message={`Free accounts include ${FREE_MAX_RESUMES} resume. Upgrade to Pro or Lifetime for unlimited resumes and every template.`}
      />
      <DashboardDocPickerOverlay
        open={docPickerOpen}
        firstName={pickerFirstName}
        onClose={dismissDocPicker}
        onResume={pickerChooseResume}
        onCoverLetter={pickerChooseCoverLetter}
        onResignation={pickerChooseResignation}
      />
      <div
        className={
          docPickerOpen
            ? "pointer-events-none blur-[1.5px] transition-[filter]"
            : ""
        }
      >
      <main className="flex-1 text-slate-200">
        {/* ─── Top tabs bar ─── */}
        <div className="border-b border-[#30363d] bg-[#161b22]/60 px-4 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <nav className="flex gap-0" aria-label="Document type">
              {DOC_TABS.map((t) => {
                const active = docTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (t.id === "cover-letters") {
                        router.push("/dashboard/cover-letter");
                      } else if (t.id === "resignation") {
                        toast("Resignation letters are coming soon.", {
                          icon: "📄",
                        });
                      } else {
                        setDocTab(t.id);
                      }
                    }}
                    className={`relative px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition ${
                      active
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t.label}
                    {active ? (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-sky-500" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            {/* ─── Feature promo cards ─── */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FEATURE_CARDS.map((card) => {
                const Icon = card.icon;
                const Wrapper = card.href ? Link : "button";
                const wrapperProps = card.href
                  ? { href: card.href }
                  : {
                      type: "button",
                      onClick: () =>
                        toast("Coming soon.", { icon: "✨" }),
                    };
                return (
                  <Wrapper
                    key={card.title}
                    {...wrapperProps}
                    className="flex items-center gap-4 rounded-xl border border-[#30363d] bg-[#161b22] px-4 py-4 text-left transition hover:border-slate-500 hover:bg-[#1c2129]"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${card.accent}22` }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: card.accent }}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {card.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {card.desc}
                      </p>
                    </div>
                  </Wrapper>
                );
              })}
            </div>

            {/* ─── Resumes section ─── */}
            <section
              className="mt-8 rounded-2xl border border-[#30363d] bg-[#161b22]"
              aria-labelledby="resumes-heading"
            >
              <div className="flex flex-col gap-3 border-b border-[#30363d] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2
                  id="resumes-heading"
                  className="text-base font-semibold text-white"
                >
                  Resumes
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none rounded-lg border border-[#30363d] bg-[#21262d] py-1.5 pl-3 pr-8 text-[11px] font-bold uppercase tracking-wide text-slate-300 outline-none focus:border-sky-500"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
                      aria-hidden
                    />
                  </div>
                  <div className="flex rounded-lg border border-[#30363d] bg-[#21262d]">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`rounded-l-lg p-1.5 transition ${
                        viewMode === "grid"
                          ? "bg-sky-500/20 text-sky-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`rounded-r-lg p-1.5 transition ${
                        viewMode === "list"
                          ? "bg-sky-500/20 text-sky-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {resumesError ? (
                  <p
                    className="rounded-lg bg-red-950/50 px-4 py-3 text-sm text-red-200 ring-1 ring-red-900/60"
                    role="alert"
                  >
                    {resumesError}
                  </p>
                ) : null}

                {resumesLoading ? (
                  <div className="space-y-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-400">
                      <Loader2
                        className="h-4 w-4 shrink-0 animate-spin text-sky-400"
                        aria-hidden
                      />
                      Loading your resumes…
                    </p>
                    <ResumeListSkeleton count={6} />
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Create new resume card */}
                    <Link
                      href="/dashboard/resume/new"
                      onClick={handleCreateClick}
                      className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#30363d] bg-transparent p-6 text-center transition hover:border-sky-500/40 hover:bg-sky-500/5"
                    >
                      <Plus className="h-8 w-8 text-slate-500" aria-hidden />
                      <span className="mt-3 text-sm font-medium text-slate-400">
                        Create new resume
                      </span>
                    </Link>

                    {sortedResumes.map((r) => (
                      <Link
                        key={r.id}
                        href={`/dashboard/resume/${r.id}`}
                        className="group relative flex min-h-[220px] flex-col rounded-xl border border-[#30363d] bg-[#0d1117] p-4 text-left transition hover:border-sky-500/40 hover:shadow-lg"
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDeleteResume(e, r.id)}
                          disabled={deletingId === r.id}
                          className="absolute right-2 top-2 z-10 rounded-lg p-1.5 text-slate-500 transition hover:bg-red-950/50 hover:text-red-400 disabled:opacity-50"
                          aria-label={`Delete ${r.title || "resume"}`}
                        >
                          {deletingId === r.id ? (
                            <Loader2
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          )}
                        </button>
                        <div className="flex-1">
                          <ResumeThumbnail
                            template={r.template}
                            content={r.content}
                          />
                        </div>
                        <div className="mt-3 border-t border-[#30363d] pt-3">
                          <p className="truncate text-sm font-semibold text-white">
                            {r.title || "Untitled resume"}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                            {getTemplateLabel(r.template)} ·{" "}
                            {formatResumeDate(r.updated_at)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  /* ─── List view ─── */
                  <div className="divide-y divide-[#30363d]">
                    <Link
                      href="/dashboard/resume/new"
                      onClick={handleCreateClick}
                      className="flex items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-white/5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#30363d]">
                        <Plus className="h-5 w-5 text-slate-500" aria-hidden />
                      </div>
                      <span className="text-sm font-medium text-slate-400">
                        Create new resume
                      </span>
                    </Link>
                    {sortedResumes.map((r) => (
                      <Link
                        key={r.id}
                        href={`/dashboard/resume/${r.id}`}
                        className="group flex items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-white/5"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117]">
                          <ResumeThumbnail
                            template={r.template}
                            content={r.content}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {r.title || "Untitled resume"}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                            {getTemplateLabel(r.template)} ·{" "}
                            {formatResumeDate(r.updated_at)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteResume(e, r.id)}
                          disabled={deletingId === r.id}
                          className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-950/50 hover:text-red-400 disabled:opacity-50"
                          aria-label={`Delete ${r.title || "resume"}`}
                        >
                          {deletingId === r.id ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}

                {!resumesLoading && resumes.length === 0 ? (
                  <div className="flex min-h-[200px] flex-col items-center justify-center py-10 text-center">
                    <EmptyResumeIllustration />
                    <p className="mt-6 text-lg font-semibold text-white">
                      No resumes yet
                    </p>
                    <p className="mt-2 max-w-md text-sm text-slate-400">
                      Create your first ATS-friendly resume with AI-assisted
                      bullets, templates, and PDF export.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </main>
      </div>
    </DashboardShell>
  );
}
