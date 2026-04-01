"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePenLine,
  Plus,
  LayoutGrid,
  Loader2,
  Trash2,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { ResumeThumbnail } from "@/components/templates/ResumeThumbnail";
import { getTemplateLabel } from "@/components/templates";
import { DashboardShell } from "@/components/DashboardShell";
import { UpgradeModal } from "@/components/UpgradeModal";
import { isPaidPlan, FREE_MAX_RESUMES } from "@/lib/checkPlan";
import {
  DashboardSkeleton,
  ResumeListSkeleton,
} from "@/components/skeletons/DashboardSkeleton";
import { EmptyResumeIllustration } from "@/components/illustrations/EmptyStates";
import toast from "react-hot-toast";

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

  return (
    <DashboardShell user={user} plan={plan} onLogout={handleLogout}>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Upgrade to create more resumes"
        message={`Free accounts include ${FREE_MAX_RESUMES} resume. Upgrade to Pro or Lifetime for unlimited resumes and every template.`}
      />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {displayName}
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                <span className="font-medium text-slate-800">Signed in as</span>{" "}
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-sm text-slate-700">
                  {user.email}
                </span>
              </p>
            </div>
            {atResumeLimit ? (
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:shrink-0"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Create New Resume
              </button>
            ) : (
              <Link
                href="/dashboard/resume/new"
                onClick={handleCreateClick}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:shrink-0"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Create New Resume
              </Link>
            )}
          </div>

          <section className="mt-10" aria-labelledby="resumes-heading">
            <div className="mb-4 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-slate-500" aria-hidden />
              <h2
                id="resumes-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Your resumes
              </h2>
            </div>

            {resumesError ? (
              <p
                className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {resumesError}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resumesLoading ? (
                <div className="col-span-full space-y-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Loader2
                      className="h-4 w-4 shrink-0 animate-spin text-blue-600"
                      aria-hidden
                    />
                    Loading your resumes…
                  </p>
                  <ResumeListSkeleton count={6} />
                </div>
              ) : resumes.length === 0 ? (
                <div className="col-span-full flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-b from-white to-slate-50/80 px-6 py-12 text-center shadow-sm">
                  <EmptyResumeIllustration />
                  <p className="mt-6 text-lg font-semibold text-slate-900">
                    No resumes yet
                  </p>
                  <p className="mt-2 max-w-md text-sm text-slate-600">
                    Create your first ATS-friendly resume with AI-assisted
                    bullets, templates, and PDF export.
                  </p>
                  <Link
                    href="/dashboard/resume/new"
                    onClick={handleCreateClick}
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Create your first resume
                  </Link>
                </div>
              ) : (
                resumes.map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/resume/${r.id}`}
                    className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 pr-8 font-semibold text-slate-900">
                        {r.title || "Untitled resume"}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteResume(e, r.id)}
                        disabled={deletingId === r.id}
                        className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
                    </div>
                    <div className="mt-3">
                      <ResumeThumbnail
                        template={r.template}
                        content={r.content}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-700">
                      {getTemplateLabel(r.template)} template
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Last updated
                      </span>
                      <br />
                      {formatResumeDate(r.updated_at)}
                    </p>
                    <span className="mt-3 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                      Edit →
                    </span>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}
