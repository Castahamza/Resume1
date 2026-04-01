"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  ScanSearch,
  FileText,
  Lightbulb,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { buildResumeContextForPrompt } from "@/lib/resumePromptContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { FullPageLoader } from "@/components/skeletons/DashboardSkeleton";
import toast from "react-hot-toast";

const R = 44;
const C = 2 * Math.PI * R;

function MatchRing({ score }) {
  const pct = Math.max(0, Math.min(100, score));
  const offset = C * (1 - pct / 100);
  const hue = pct >= 70 ? 145 : pct >= 45 ? 45 : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={`hsl(${hue} 65% 42%)`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tabular-nums text-slate-900">
            {pct}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Match
          </span>
        </div>
      </div>
    </div>
  );
}

export default function KeywordScannerPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumesError, setResumesError] = useState(null);

  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [scanLoading, setScanLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [matchScore, setMatchScore] = useState(null);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [hasResults, setHasResults] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    async function auth() {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      setUser(session.user);
      setAuthLoading(false);
    }
    auth();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    async function load() {
      setResumesLoading(true);
      setResumesError(null);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("resumes")
        .select("id, title, content")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        setResumesError(error.message || "Could not load resumes.");
        setResumes([]);
      } else {
        setResumes(data ?? []);
      }
      setResumesLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  async function handleScan() {
    setFormError(null);
    setHasResults(false);
    if (!jobDescription.trim()) {
      setFormError("Paste a job description to analyze.");
      return;
    }
    if (!selectedResumeId || !selectedResume) {
      setFormError("Select a resume to compare.");
      return;
    }

    const resumeContext = buildResumeContextForPrompt(selectedResume.content);

    setScanLoading(true);
    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/keyword-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          resumeContext,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 && data.code === "AI_MONTHLY_LIMIT") {
          setUpgradeMessage(
            typeof data.error === "string" && data.error
              ? data.error
              : "Monthly AI limit reached."
          );
          setUpgradeOpen(true);
          return;
        }
        const errMsg =
          typeof data.error === "string" && data.error
            ? data.error
            : "Scan failed. Try again.";
        setFormError(errMsg);
        toast.error(errMsg);
        return;
      }

      setMatchScore(typeof data.matchScore === "number" ? data.matchScore : 0);
      setMatchedKeywords(Array.isArray(data.matchedKeywords) ? data.matchedKeywords : []);
      setMissingKeywords(Array.isArray(data.missingKeywords) ? data.missingKeywords : []);
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setHasResults(true);
      toast.success("Keyword scan complete.");
    } catch {
      const errMsg = "Network error. Check your connection.";
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setScanLoading(false);
    }
  }

  if (authLoading || !user) {
    return <FullPageLoader label="Loading keyword scanner…" />;
  }

  const barPct = matchScore != null ? Math.max(0, Math.min(100, matchScore)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-slate-50">
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="AI generation limit"
        message={upgradeMessage}
      />
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Dashboard
          </Link>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2 text-slate-900">
            <ScanSearch className="h-5 w-5 text-blue-600" aria-hidden />
            <h1 className="text-lg font-bold">Keyword scanner</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="max-w-2xl text-sm text-slate-600">
          Paste a job posting and compare it to one of your resumes. We use AI to
          pull ATS-relevant terms, check what&apos;s already reflected in your
          resume, and suggest concrete improvements.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Job description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={14}
              className="mt-3 w-full resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Paste the full job description or requirements here…"
            />
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <FileText className="h-4 w-4 text-blue-600" aria-hidden />
                Resume to analyze
              </h2>
              {resumesLoading ? (
                <div className="mt-3 space-y-2" aria-hidden>
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                  <p className="text-xs text-slate-500">Loading resumes…</p>
                </div>
              ) : resumesError ? (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {resumesError}
                </p>
              ) : resumes.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">
                  No resumes yet.{" "}
                  <Link
                    href="/dashboard/resume/new"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Create one
                  </Link>
                  .
                </p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="mt-3 min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Choose a resume…</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || "Untitled resume"}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {formError ? (
              <p
                className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {formError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleScan}
              disabled={scanLoading || resumes.length === 0}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-60"
            >
              {scanLoading ? (
                <span className="inline-flex items-center gap-2">
                  Scanning
                  <LoadingDots className="text-white" />
                </span>
              ) : (
                <>
                  <ScanSearch className="h-4 w-4" aria-hidden />
                  Scan keywords
                </>
              )}
            </button>
          </section>
        </div>

        {hasResults && matchScore != null ? (
          <section
            className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            aria-labelledby="scan-results-heading"
          >
            <h2
              id="scan-results-heading"
              className="text-lg font-bold text-slate-900"
            >
              Scan results
            </h2>

            <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="flex flex-col items-center lg:shrink-0">
                <MatchRing score={matchScore} />
                <div className="mt-4 w-full max-w-xs lg:w-48">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Keyword alignment</span>
                    <span>{barPct}%</span>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <Check
                        className="h-4 w-4 shrink-0 text-emerald-600"
                        aria-hidden
                      />
                      Matched ({matchedKeywords.length})
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {matchedKeywords.length === 0 ? (
                        <li className="text-sm text-slate-500">None yet</li>
                      ) : (
                        matchedKeywords.map((k) => (
                          <li
                            key={k}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900"
                          >
                            <Check className="h-3 w-3 text-emerald-600" aria-hidden />
                            {k}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-red-800">
                      <X className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
                      Missing ({missingKeywords.length})
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {missingKeywords.length === 0 ? (
                        <li className="text-sm text-slate-500">
                          Great — no obvious gaps from this posting.
                        </li>
                      ) : (
                        missingKeywords.map((k) => (
                          <li
                            key={k}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-900"
                          >
                            <X className="h-3 w-3 text-red-600" aria-hidden />
                            {k}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
                    Suggestions
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {suggestions.length === 0 ? (
                      <li className="text-slate-500">No extra suggestions.</li>
                    ) : (
                      suggestions.map((s, i) => <li key={i}>{s}</li>)
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
