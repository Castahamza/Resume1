"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpCircle, Bookmark, Search } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import {
  isPaidPlan,
  FREE_MAX_RESUMES,
  FREE_MONTHLY_AI_LIMIT,
} from "@/lib/checkPlan";
import {
  MOCK_SAMPLE_LIBRARY,
  SAMPLE_LIBRARY_CATEGORIES,
} from "@/lib/sampleLibraryMock";

const SAVED_STORAGE_KEY = "zoru-sample-library-saved";

function readSavedIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeSavedIds(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export default function SampleLibraryPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("free");
  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);

  const [listTab, setListTab] = useState("all");
  const [category, setCategory] = useState("pro");
  const [query, setQuery] = useState("");
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    setSavedIds(readSavedIds());
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    async function load() {
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
      if (mounted) setAuthLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      setUser(session.user);
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
      const supabase = getSupabase();
      const { data } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", user.id);

      if (!cancelled) {
        setResumes(data ?? []);
        setResumesLoading(false);
      }
    }

    loadResumes();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = MOCK_SAMPLE_LIBRARY.filter((s) =>
      category === "pro" ? s.isPro : s.category === category
    );
    if (listTab === "saved") {
      const set = new Set(savedIds);
      list = list.filter((s) => set.has(s.id));
    }
    if (q) {
      list = list.filter(
        (s) =>
          s.company.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, listTab, query, savedIds]);

  async function handleLogout() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function handleNewResumeClick(e) {
    if (!isPaidPlan(plan) && resumes.length >= FREE_MAX_RESUMES) {
      e.preventDefault();
      window.location.href = "/#pricing";
    }
  }

  function toggleSaved(sampleId) {
    setSavedIds((prev) => {
      const next = prev.includes(sampleId)
        ? prev.filter((id) => id !== sampleId)
        : [...prev, sampleId];
      writeSavedIds(next);
      return next;
    });
  }

  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardShell
      user={user}
      plan={plan}
      headerTitle="Sample library"
      onLogout={handleLogout}
      onNewResumeClick={handleNewResumeClick}
      usageSummary={{
        resumeCount: resumes.length,
        resumeLimit: isPaidPlan(plan) ? null : FREE_MAX_RESUMES,
        aiUsed: 0,
        aiLimit: isPaidPlan(plan) ? 0 : FREE_MONTHLY_AI_LIMIT,
      }}
      showUpgradeButton={!isPaidPlan(plan)}
      onUpgradeClick={() => {
        window.location.href = "/#pricing";
      }}
    >
      <main className="flex-1 bg-[#0d1117] px-4 py-6 text-slate-200 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setListTab("all")}
                className={`rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                  listTab === "all"
                    ? "bg-sky-500 text-white"
                    : "border border-white/25 bg-transparent text-white hover:bg-white/5"
                }`}
              >
                All samples
              </button>
              <button
                type="button"
                onClick={() => setListTab("saved")}
                className={`rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                  listTab === "saved"
                    ? "bg-sky-500 text-white"
                    : "border border-white/25 bg-transparent text-white hover:bg-white/5"
                }`}
              >
                Saved ({savedIds.length})
              </button>
            </div>
            {!isPaidPlan(plan) ? (
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/#pricing";
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500"
              >
                <ArrowUpCircle className="h-4 w-4" aria-hidden />
                Upgrade
              </button>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-[#30363d] bg-[#161b22] p-4 sm:p-5">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resume and cover letter samples by role or skill"
                className="w-full rounded-xl border border-[#30363d] bg-[#0d1117] py-3 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </label>

            <div
              className="mt-4 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Sample categories"
            >
              {SAMPLE_LIBRARY_CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(c.id)}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition ${
                      active
                        ? "bg-sky-500 text-white"
                        : "border border-[#30363d] bg-[#21262d] text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {resumesLoading ? (
            <p className="mt-8 text-sm text-slate-400">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-[#30363d] bg-[#161b22]/80 px-8 py-14 text-center">
              <p className="text-base font-semibold text-white">
                {listTab === "saved"
                  ? "No saved samples in this category"
                  : "No samples match your search"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {listTab === "saved"
                  ? "Use the bookmark on a card to save samples for later."
                  : "Try another keyword or category."}
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s) => {
                const saved = savedIds.includes(s.id);
                const initials = s.company
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <li key={s.id}>
                    <article className="group overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] transition hover:border-slate-500">
                      <div
                        className="relative aspect-[4/5] max-h-52 border-b border-[#30363d] sm:max-h-none sm:aspect-[3/4]"
                        style={{
                          background: `linear-gradient(160deg, ${s.accent}33 0%, #0d1117 55%, #161b22 100%)`,
                        }}
                      >
                        <div
                          className="absolute inset-3 rounded-lg border border-white/10 bg-white/[0.04] shadow-inner"
                          aria-hidden
                        >
                          <div className="space-y-2 p-3">
                            <div className="h-2 w-3/4 rounded bg-white/20" />
                            <div className="h-2 w-full rounded bg-white/10" />
                            <div className="h-2 w-5/6 rounded bg-white/10" />
                            <div className="mt-4 h-2 w-1/2 rounded bg-white/15" />
                            <div className="h-2 w-full rounded bg-white/10" />
                            <div className="h-2 w-4/5 rounded bg-white/10" />
                          </div>
                        </div>
                        {s.isPro ? (
                          <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                            Pro
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => toggleSaved(s.id)}
                          className={`absolute right-2 top-2 rounded-lg p-1.5 transition ${
                            saved
                              ? "bg-sky-500 text-white"
                              : "bg-black/50 text-slate-300 hover:bg-black/70 hover:text-white"
                          }`}
                          aria-label={saved ? "Remove from saved" : "Save sample"}
                        >
                          <Bookmark
                            className="h-4 w-4"
                            fill={saved ? "currentColor" : "none"}
                            aria-hidden
                          />
                        </button>
                      </div>
                      <div className="flex items-start gap-3 p-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: `${s.accent}cc` }}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {s.company}
                          </p>
                          <p className="mt-0.5 text-sm font-medium leading-snug text-white">
                            {s.role}
                          </p>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
