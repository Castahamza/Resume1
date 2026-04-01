"use client";

import { useState, useRef, forwardRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  User,
  Briefcase,
  GraduationCap,
  Tags,
  Loader2,
  Download,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import {
  normalizeResumeContent,
  buildResumeContentPayload,
  emptyExperience,
  emptyEducation,
} from "@/lib/resumeContent";
import {
  RESUME_TEMPLATES,
  normalizeTemplateId,
  templateMap,
} from "@/components/templates";
import { ResumeScore } from "@/components/ResumeScore";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  canUseTemplate,
  FREE_TEMPLATE_ID,
} from "@/lib/checkPlan";
import toast from "react-hot-toast";
import { LoadingDots } from "@/components/ui/LoadingDots";

/**
 * Renders a DOM node to a multi-page A4 PDF with margins (mm).
 */
async function buildResumePdf(element) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = usableWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let heightLeft = imgHeight;
  let offsetY = margin;

  pdf.addImage(imgData, "JPEG", margin, offsetY, imgWidth, imgHeight);
  heightLeft -= usableHeight;

  while (heightLeft > 1) {
    offsetY = margin - (imgHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", margin, offsetY, imgWidth, imgHeight);
    heightLeft -= usableHeight;
  }

  pdf.save("resume.pdf");
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
        <Icon className="h-4 w-4 text-blue-600" aria-hidden />
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
    >
      {children}
    </label>
  );
}

function Input(props) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${className}`}
      {...rest}
    />
  );
}

function TextArea(props) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      rows={4}
      className={`mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${className}`}
      {...rest}
    />
  );
}

const ResumePreview = forwardRef(function ResumePreview(
  { personal, experiences, educations, skills, template },
  ref
) {
  const templateId = normalizeTemplateId(template);
  const Template = templateMap[templateId] ?? templateMap.modern;

  return (
    <div className="min-h-[min(70vh,880px)] rounded-lg border border-slate-200 bg-slate-100/80 p-4 shadow-inner sm:p-6 print:bg-white">
      <div
        ref={ref}
        className="mx-auto max-w-[8.5in] bg-white px-6 py-8 text-slate-900 shadow-none sm:px-10 sm:py-10 print:shadow-none"
      >
        <Template
          personal={personal}
          experiences={experiences}
          educations={educations}
          skills={skills}
        />
      </div>
    </div>
  );
});

ResumePreview.displayName = "ResumePreview";

export function ResumeEditor({
  resumeId: resumeIdProp = null,
  initialTitle,
  initialTemplate = "default",
  initialContent = null,
  pageHeading = "Resume",
}) {
  const router = useRouter();
  const normalized = normalizeResumeContent(initialContent);

  const [personal, setPersonal] = useState(() => ({
    ...normalized.personal,
  }));
  const [experiences, setExperiences] = useState(() => [
    ...normalized.experiences,
  ]);
  const [educations, setEducations] = useState(() => [
    ...normalized.educations,
  ]);
  const [skills, setSkills] = useState(() => [...normalized.skills]);
  const [title, setTitle] = useState(
    () =>
      (initialTitle && String(initialTitle).trim()) || "Untitled resume"
  );
  const [template, setTemplate] = useState(() =>
    normalizeTemplateId(initialTemplate)
  );
  const [localResumeId, setLocalResumeId] = useState(null);

  const [skillInput, setSkillInput] = useState("");
  const [aiLoadingFor, setAiLoadingFor] = useState(null);
  const [aiErrors, setAiErrors] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const previewRef = useRef(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState({
    open: false,
    title: "Upgrade to Pro",
    message: "",
  });
  const saveInProgress = useRef(false);
  const latestRef = useRef({});

  useEffect(() => {
    latestRef.current = {
      personal,
      experiences,
      educations,
      skills,
      title,
      template,
      resumeIdProp,
      localResumeId,
    };
  }, [
    personal,
    experiences,
    educations,
    skills,
    title,
    template,
    resumeIdProp,
    localResumeId,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) setUserPlan(data?.plan ?? "free");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (userPlan == null) return;
    setTemplate((t) => (canUseTemplate(userPlan, t) ? t : FREE_TEMPLATE_ID));
  }, [userPlan]);

  const persistResume = useCallback(
    async ({ showToast }) => {
      if (saveInProgress.current) return { ok: false };
      saveInProgress.current = true;
      setSaveError(null);
      try {
        const supabase = getSupabase();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/login");
          return { ok: false };
        }

        const snap = latestRef.current;
        const content = buildResumeContentPayload(
          snap.personal,
          snap.experiences,
          snap.educations,
          snap.skills
        );
        const rowTitle = (snap.title || "").trim() || "Untitled resume";
        const activeId = snap.resumeIdProp ?? snap.localResumeId;

        if (!activeId) {
          const { data, error } = await supabase
            .from("resumes")
            .insert({
              user_id: user.id,
              title: rowTitle,
              content,
              template: snap.template,
            })
            .select("id")
            .single();
          if (error) {
            const msg = error.message || "";
            if (
              msg.toLowerCase().includes("row-level security") ||
              error.code === "42501"
            ) {
              setUpgradeModal({
                open: true,
                title: "Resume limit reached",
                message:
                  "Free accounts can save one resume. Upgrade to Pro or Lifetime for unlimited resumes.",
              });
            }
            setSaveError(
              msg || "Could not save resume. Check your connection."
            );
            toast.error(msg || "Could not save resume.");
            return { ok: false };
          }
          setLocalResumeId(data.id);
          router.replace(`/dashboard/resume/${data.id}`);
          if (showToast) toast.success("Resume saved successfully.");
          return { ok: true };
        }

        const { error: upErr } = await supabase
          .from("resumes")
          .update({
            title: rowTitle,
            content,
            template: snap.template,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeId)
          .eq("user_id", user.id);

        if (upErr) {
          setSaveError(
            upErr.message || "Could not update resume. Check your connection."
          );
          toast.error(
            upErr.message || "Could not update resume. Check your connection."
          );
          return { ok: false };
        }
        if (showToast) toast.success("Resume saved successfully.");
        return { ok: true };
      } catch (e) {
        console.error(e);
        setSaveError("Something went wrong while saving.");
        toast.error("Something went wrong while saving.");
        return { ok: false };
      } finally {
        saveInProgress.current = false;
      }
    },
    [router]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      void persistResume({ showToast: false });
    }, 30000);
    return () => clearInterval(intervalId);
  }, [persistResume]);

  function updatePersonal(field, value) {
    setPersonal((p) => ({ ...p, [field]: value }));
  }

  function updateExperience(id, field, value) {
    setExperiences((list) =>
      list.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function addExperience() {
    setExperiences((list) => [...list, emptyExperience()]);
  }

  function removeExperience(id) {
    setExperiences((list) =>
      list.length <= 1 ? list : list.filter((e) => e.id !== id)
    );
  }

  function updateBullet(expId, bulletIndex, value) {
    setExperiences((list) =>
      list.map((e) => {
        if (e.id !== expId) return e;
        const bullets = [...e.bullets];
        bullets[bulletIndex] = value;
        return { ...e, bullets };
      })
    );
  }

  function addBullet(expId) {
    setExperiences((list) =>
      list.map((e) =>
        e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e
      )
    );
  }

  function removeBullet(expId, bulletIndex) {
    setExperiences((list) =>
      list.map((e) => {
        if (e.id !== expId) return e;
        if (e.bullets.length <= 1) return e;
        const bullets = e.bullets.filter((_, i) => i !== bulletIndex);
        return { ...e, bullets };
      })
    );
  }

  function updateEducation(id, field, value) {
    setEducations((list) =>
      list.map((ed) => (ed.id === id ? { ...ed, [field]: value } : ed))
    );
  }

  function addEducation() {
    setEducations((list) => [...list, emptyEducation()]);
  }

  function removeEducation(id) {
    setEducations((list) =>
      list.length <= 1 ? list : list.filter((ed) => ed.id !== id)
    );
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;
    setSkills((prev) => [...prev, s]);
    setSkillInput("");
  }

  function removeSkill(skill) {
    setSkills((prev) => prev.filter((x) => x !== skill));
  }

  async function handleSave() {
    setSaveLoading(true);
    try {
      await persistResume({ showToast: true });
    } finally {
      setSaveLoading(false);
    }
  }

  function mergeGeneratedBullets(exp, generated) {
    const cleaned = generated
      .filter((b) => typeof b === "string" && b.trim().length > 0)
      .map((b) => b.trim());
    if (cleaned.length === 0) return exp.bullets;
    const existing = exp.bullets.map((b) => b.trim()).filter(Boolean);
    if (existing.length === 0) {
      return cleaned;
    }
    return [...existing, ...cleaned];
  }

  async function handleGenerateAi(exp) {
    setAiErrors((prev) => ({ ...prev, [exp.id]: null }));
    if (!exp.jobTitle?.trim()) {
      setAiErrors((prev) => ({
        ...prev,
        [exp.id]:
          "Add a job title above, then try again—we use it to tailor your bullets.",
      }));
      return;
    }

    setAiLoadingFor(exp.id);
    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          jobTitle: exp.jobTitle.trim(),
          description: (exp.roleDescription ?? "").trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 403 && data.code === "AI_MONTHLY_LIMIT") {
          setUpgradeModal({
            open: true,
            title: "AI generation limit",
            message:
              typeof data.error === "string" && data.error
                ? data.error
                : "You’ve used your free AI generations for this month.",
          });
          setAiErrors((prev) => ({ ...prev, [exp.id]: null }));
          return;
        }
        const msg =
          typeof data.error === "string" && data.error
            ? data.error
            : "Something went wrong. Please try again.";
        setAiErrors((prev) => ({ ...prev, [exp.id]: msg }));
        return;
      }

      if (!Array.isArray(data.bullets)) {
        setAiErrors((prev) => ({
          ...prev,
          [exp.id]: "Unexpected response. Please try again.",
        }));
        return;
      }

      setExperiences((list) =>
        list.map((e) =>
          e.id === exp.id
            ? { ...e, bullets: mergeGeneratedBullets(e, data.bullets) }
            : e
        )
      );
      setAiErrors((prev) => ({ ...prev, [exp.id]: null }));
    } catch {
      setAiErrors((prev) => ({
        ...prev,
        [exp.id]:
          "Network error—check your connection and try again.",
      }));
    } finally {
      setAiLoadingFor(null);
    }
  }

  async function handleDownloadPdf() {
    const el = previewRef.current;
    if (!el) {
      toast.error("Preview is not ready. Refresh the page and try again.");
      return;
    }
    setPdfLoading(true);
    try {
      await buildResumePdf(el);
      toast.success("PDF downloaded.");
    } catch (err) {
      console.error(err);
      toast.error(
        "Couldn’t create your PDF. Try again, or use a smaller preview."
      );
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() =>
          setUpgradeModal((m) => ({ ...m, open: false }))
        }
        title={upgradeModal.title}
        message={
          upgradeModal.message ||
          "Upgrade for unlimited AI, templates, and resumes."
        }
      />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3">
          {saveError ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {saveError}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Dashboard
            </Link>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">
              {pageHeading}
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-[44px] min-w-0 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:min-w-[10rem] sm:max-w-md sm:flex-1 sm:py-1.5"
              placeholder="Resume title"
              aria-label="Resume title"
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:min-h-0 sm:py-2"
            >
              {pdfLoading ? (
                <>
                  <Loader2
                    className="h-4 w-4 shrink-0 animate-spin"
                    aria-hidden="true"
                  />
                  Building PDF…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Download PDF
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveLoading}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:min-h-0 sm:py-2"
            >
              {saveLoading ? (
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Save
            </button>
          </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-3 py-5 sm:px-4 sm:py-6 lg:grid-cols-2 lg:gap-8 lg:px-6 lg:py-8">
        <div className="space-y-6 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-2">
          <FormSection title="Personal Info" icon={User}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={personal.fullName}
                  onChange={(e) => updatePersonal("fullName", e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personal.email}
                  onChange={(e) => updatePersonal("email", e.target.value)}
                  placeholder="jane@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={personal.phone}
                  onChange={(e) => updatePersonal("phone", e.target.value)}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={personal.location}
                  onChange={(e) => updatePersonal("location", e.target.value)}
                  placeholder="City, State"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={personal.linkedin}
                  onChange={(e) => updatePersonal("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="summary">Summary</Label>
                <TextArea
                  id="summary"
                  value={personal.summary}
                  onChange={(e) => updatePersonal("summary", e.target.value)}
                  placeholder="Brief professional summary..."
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Experience" icon={Briefcase}>
            <div className="space-y-6">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Role {idx + 1}
                    </span>
                    {experiences.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        aria-label={`Remove experience ${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`co-${exp.id}`}>Company</Label>
                      <Input
                        id={`co-${exp.id}`}
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id, "company", e.target.value)
                        }
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div>
                      <Label htmlFor={`title-${exp.id}`}>Job title</Label>
                      <Input
                        id={`title-${exp.id}`}
                        value={exp.jobTitle}
                        onChange={(e) =>
                          updateExperience(exp.id, "jobTitle", e.target.value)
                        }
                        placeholder="Product Manager"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor={`dates-${exp.id}`}>Dates</Label>
                      <Input
                        id={`dates-${exp.id}`}
                        value={exp.dates}
                        onChange={(e) =>
                          updateExperience(exp.id, "dates", e.target.value)
                        }
                        placeholder="Jan 2022 – Present"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor={`role-desc-${exp.id}`}>
                        Role description{" "}
                        <span className="font-normal normal-case text-slate-500">
                          (optional, helps AI)
                        </span>
                      </Label>
                      <TextArea
                        id={`role-desc-${exp.id}`}
                        rows={3}
                        value={exp.roleDescription ?? ""}
                        onChange={(e) =>
                          updateExperience(
                            exp.id,
                            "roleDescription",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Led a team of 5, owned the checkout flow, worked with Stripe and React…"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Bullet points
                      </span>
                      <button
                        type="button"
                        onClick={() => handleGenerateAi(exp)}
                        disabled={aiLoadingFor === exp.id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900 shadow-sm transition hover:bg-violet-100 disabled:pointer-events-none disabled:opacity-60"
                      >
                        {aiLoadingFor === exp.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span>Generating</span>
                            <LoadingDots className="text-violet-900" />
                          </span>
                        ) : (
                          <>✨ Generate with AI</>
                        )}
                      </button>
                    </div>
                    {aiErrors[exp.id] ? (
                      <p
                        className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800"
                        role="alert"
                      >
                        {aiErrors[exp.id]}
                      </p>
                    ) : null}
                    <ul className="mt-2 space-y-2">
                      {exp.bullets.map((bullet, bi) => (
                        <li key={bi} className="flex gap-2">
                          <Input
                            value={bullet}
                            onChange={(e) =>
                              updateBullet(exp.id, bi, e.target.value)
                            }
                            placeholder="Achievement or responsibility..."
                            aria-label={`Bullet ${bi + 1}`}
                          />
                          {exp.bullets.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeBullet(exp.id, bi)}
                              className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove bullet"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => addBullet(exp.id)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      Add bullet
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add experience
              </button>
            </div>
          </FormSection>

          <FormSection title="Education" icon={GraduationCap}>
            <div className="space-y-4">
              {educations.map((ed, idx) => (
                <div
                  key={ed.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      School {idx + 1}
                    </span>
                    {educations.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeEducation(ed.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor={`school-${ed.id}`}>School</Label>
                      <Input
                        id={`school-${ed.id}`}
                        value={ed.school}
                        onChange={(e) =>
                          updateEducation(ed.id, "school", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`degree-${ed.id}`}>Degree</Label>
                      <Input
                        id={`degree-${ed.id}`}
                        value={ed.degree}
                        onChange={(e) =>
                          updateEducation(ed.id, "degree", e.target.value)
                        }
                        placeholder="B.S. Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ed-dates-${ed.id}`}>Dates</Label>
                      <Input
                        id={`ed-dates-${ed.id}`}
                        value={ed.dates}
                        onChange={(e) =>
                          updateEducation(ed.id, "dates", e.target.value)
                        }
                        placeholder="2018 – 2022"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add education
              </button>
            </div>
          </FormSection>

          <FormSection title="Skills" icon={Tags}>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="group inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-900 transition hover:bg-blue-200"
                  title="Click to remove"
                >
                  {skill}
                  <span className="text-blue-600 group-hover:text-blue-800">
                    ×
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill, press Enter"
                className="flex-1"
              />
              <button
                type="button"
                onClick={addSkill}
                className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add
              </button>
            </div>
          </FormSection>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p
              id="template-select-label"
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Résumé template
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Linear layouts optimized for ATS screening and clean PDF export.
            </p>
            <div
              className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
              role="group"
              aria-labelledby="template-select-label"
            >
              {RESUME_TEMPLATES.map((opt) => {
                const locked =
                  userPlan != null && !canUseTemplate(userPlan, opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (locked) {
                        setUpgradeModal({
                          open: true,
                          title: "Premium template",
                          message:
                            "Classic and Creative templates are included with Pro and Lifetime.",
                        });
                        return;
                      }
                      setTemplate(opt.id);
                    }}
                    className={`relative flex min-w-0 flex-1 flex-col rounded-lg border px-3 py-2 text-left text-sm transition sm:min-w-[7.5rem] sm:flex-none ${
                      template === opt.id
                        ? "border-blue-600 bg-blue-50 font-semibold text-blue-900 ring-1 ring-blue-600"
                        : locked
                          ? "border-slate-200 bg-slate-100/80 text-slate-500 hover:border-slate-300"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {locked ? (
                      <span className="absolute right-2 top-2 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900">
                        Pro
                      </span>
                    ) : null}
                    <span>{opt.label}</span>
                    <span className="mt-0.5 text-[11px] font-normal text-slate-500">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            Live preview
          </p>
          <ResumePreview
            ref={previewRef}
            template={template}
            personal={personal}
            experiences={experiences}
            educations={educations}
            skills={skills}
          />
          <div className="mt-4">
            <ResumeScore
              personal={personal}
              experiences={experiences}
              educations={educations}
              skills={skills}
              userPlan={userPlan}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
