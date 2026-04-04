"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  FileText,
  Loader2,
  Sparkles,
  Save,
  Download,
  ScrollText,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { buildResumeContextForPrompt } from "@/lib/resumePromptContext";
import { exportDomToPdf } from "@/lib/pdfFromElement";
import { UpgradeModal } from "@/components/UpgradeModal";
import { EmptyCoverLettersIllustration } from "@/components/illustrations/EmptyStates";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { FullPageLoader } from "@/components/skeletons/DashboardSkeleton";
import toast from "react-hot-toast";

export default function CoverLetterPage() {
  const router = useRouter();
  const pdfRef = useRef(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumesError, setResumesError] = useState(null);

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [letter, setLetter] = useState("");
  const [generateLoading, setGenerateLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [formError, setFormError] = useState(null);
  const [savedLetterId, setSavedLetterId] = useState(null);
  const [savedLetters, setSavedLetters] = useState([]);
  const [savedLettersLoading, setSavedLettersLoading] = useState(true);;
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

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    async function loadSaved() {
      setSavedLettersLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("cover_letters")
        .select(
          "id, job_title, company_name, job_description, resume_id, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        console.error(error);
        setSavedLetters([]);
      } else {
        setSavedLetters(data ?? []);
      }
      setSavedLettersLoading(false);
    }

    loadSaved();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  async function loadSavedLetter(row) {
    setFormError(null);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("cover_letters")
      .select(
        "content, job_title, company_name, job_description, resume_id, id"
      )
      .eq("id", row.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      toast.error("Could not load that letter.");
      return;
    }

    setLetter(data.content ?? "");
    setJobTitle(data.job_title ?? "");
    setCompanyName(data.company_name ?? "");
    setJobDescription(data.job_description ?? "");
    setSelectedResumeId(data.resume_id || "");
    setSavedLetterId(data.id);
  }

  function handleStartFresh() {
    setSavedLetterId(null);
    setLetter("");
    setFormError(null);
  }

  async function handleGenerate() {
    setFormError(null);
    if (!selectedResumeId || !selectedResume) {
      setFormError("Select a resume to personalize the letter.");
      return;
    }
    if (!jobTitle.trim()) {
      setFormError("Enter the job title.");
      return;
    }
    if (!companyName.trim()) {
      setFormError("Enter the company name.");
      return;
    }
    if (!jobDescription.trim()) {
      setFormError("Paste or type the job description.");
      return;
    }

    const resumeContext = buildResumeContextForPrompt(selectedResume.content);

    setGenerateLoading(true);
    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          companyName: companyName.trim(),
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
            : "Generation failed. Try again.";
        setFormError(errMsg);
        toast.error(errMsg);
        return;
      }
      if (typeof data.letter !== "string") {
        const errMsg = "Unexpected response. Try again.";
        setFormError(errMsg);
        toast.error(errMsg);
        return;
      }
      setLetter(data.letter);
      setSavedLetterId(null);
      toast.success("Cover letter generated.");
    } catch {
      const errMsg = "Network error. Check your connection.";
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setGenerateLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    if (!letter.trim()) {
      const msg = "Generate or write a letter before saving.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!selectedResumeId) {
      const msg = "Select which resume this letter is based on.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setFormError(null);
    setSaveLoading(true);
    try {
      const supabase = getSupabase();
      const payload = {
        resume_id: selectedResumeId,
        job_title: jobTitle.trim() || "Role",
        company_name: companyName.trim() || "Company",
        job_description: jobDescription.trim(),
        content: letter.trim(),
        updated_at: new Date().toISOString(),
      };

      if (savedLetterId) {
        const { error } = await supabase
          .from("cover_letters")
          .update(payload)
          .eq("id", savedLetterId)
          .eq("user_id", user.id);
        if (error) throw error;
        toast.success("Cover letter updated.");
      } else {
        const { data, error } = await supabase
          .from("cover_letters")
          .insert({
            user_id: user.id,
            ...payload,
          })
          .select("id")
          .single();
        if (error) throw error;
        if (data?.id) setSavedLetterId(data.id);
        toast.success("Cover letter saved.");
      }

      const { data: list } = await supabase
        .from("cover_letters")
        .select(
          "id, job_title, company_name, job_description, resume_id, updated_at"
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      setSavedLetters(list ?? []);
    } catch (e) {
      console.error(e);
      const msg =
        e?.message ||
        "Could not save. Create the cover_letters table in Supabase if you haven’t yet.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDownloadPdf() {
    const el = pdfRef.current;
    if (!el) {
      toast.error("Nothing to export yet.");
      return;
    }
    if (!letter.trim()) {
      toast.error("Add letter text before downloading.");
      return;
    }
    setPdfLoading(true);
    try {
      const { usedPrintFallback } = await exportDomToPdf(
        el,
        "cover-letter.pdf"
      );
      if (usedPrintFallback) {
        toast(
          "Print dialog opened — choose “Save as PDF” or “Microsoft Print to PDF”.",
          { duration: 6500 }
        );
      } else {
        toast.success("PDF downloaded.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not create PDF. Try again.");
    } finally {
      setPdfLoading(false);
    }
  }

  function formatLetterDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  }

  if (authLoading || !user) {
    return <FullPageLoader label="Loading cover letter workspace…" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-slate-50">
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="AI generation limit"
        message={upgradeMessage}
      />
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Dashboard
            </Link>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2 text-slate-900">
              <ScrollText className="h-5 w-5 text-blue-600" aria-hidden />
              <h1 className="text-lg font-bold">Cover letter</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="text-sm text-slate-600">
          Generate a tailored letter from one of your saved resumes and the job
          posting. Edit the result, then save or export to PDF.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Saved cover letters
            </h2>
            <button
              type="button"
              onClick={handleStartFresh}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 sm:text-right"
            >
              Start a new letter
            </button>
          </div>
          {savedLettersLoading ? (
            <div className="mt-4 space-y-3" aria-hidden>
              <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
          ) : savedLetters.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center">
              <EmptyCoverLettersIllustration />
              <p className="mt-4 font-medium text-slate-900">
                No saved cover letters yet
              </p>
              <p className="mt-2 max-w-sm text-sm text-slate-600">
                Fill out the job details below and generate your first letter,
                then save it here for quick access.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {savedLetters.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => loadSavedLetter(s)}
                    className="flex w-full flex-col items-start gap-1 py-3 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="font-medium text-slate-900">
                      {s.company_name} · {s.job_title}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatLetterDate(s.updated_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Briefcase className="h-4 w-4 text-blue-600" aria-hidden />
                Role & company
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="cl-job-title"
                    className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Job title
                  </label>
                  <input
                    id="cl-job-title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. Senior Product Manager"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cl-company"
                    className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Company name
                  </label>
                  <input
                    id="cl-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Building2 className="h-4 w-4 text-blue-600" aria-hidden />
                Job description
              </h2>
              <textarea
                id="cl-jd"
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-4 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Paste the job posting or key responsibilities and requirements…"
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <FileText className="h-4 w-4 text-blue-600" aria-hidden />
                Base resume
              </h2>
              {resumesLoading ? (
                <p className="mt-4 text-sm text-slate-500">Loading resumes…</p>
              ) : resumesError ? (
                <p className="mt-4 text-sm text-red-700" role="alert">
                  {resumesError}
                </p>
              ) : resumes.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  No resumes yet.{" "}
                  <Link
                    href="/dashboard/resume/new"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Create one first
                  </Link>
                  .
                </p>
              ) : (
                <select
                  id="cl-resume"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="mt-4 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Choose a resume…</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title || "Untitled resume"}
                    </option>
                  ))}
                </select>
              )}
            </section>

            {formError ? (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {formError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generateLoading || resumes.length === 0}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-60"
            >
              {generateLoading ? (
                <span className="inline-flex items-center gap-2">
                  Generating
                  <LoadingDots className="text-white" />
                </span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Generate cover letter
                </>
              )}
            </button>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Your letter
                </h2>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveLoading || !letter.trim()}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50 sm:w-auto sm:min-h-0 sm:py-2"
                  >
                    {saveLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Save className="h-3.5 w-3.5" aria-hidden />
                    )}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading || !letter.trim()}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto sm:min-h-0 sm:py-2"
                  >
                    {pdfLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Download className="h-3.5 w-3.5" aria-hidden />
                    )}
                    Download PDF
                  </button>
                </div>
              </div>
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                rows={20}
                className="mt-4 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 font-serif text-sm leading-relaxed text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Generated text will appear here. You can edit every line."
              />
            </section>

            <p className="text-xs text-slate-500">
              PDF is generated from the formatted preview below (matches your
              text).
            </p>
            {/* Off-screen printable region for html2canvas */}
            <div className="overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
              <div
                ref={pdfRef}
                data-pdf-print-root
                className="mx-auto min-h-[200px] max-w-[8.5in] bg-white p-8 font-serif text-[13px] leading-relaxed text-slate-900 whitespace-pre-wrap shadow-sm print:shadow-none"
              >
                {letter.trim() || (
                  <span className="text-slate-400">Letter preview for PDF…</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
