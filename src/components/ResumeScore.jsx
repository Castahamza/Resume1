"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, ClipboardCheck } from "lucide-react";
import { isPaidPlan } from "@/lib/checkPlan";

const R = 40;
const C = 2 * Math.PI * R;

const ACTION_VERB_RE =
  /^(led|managed|built|developed|designed|implemented|created|delivered|improved|increased|reduced|decreased|spearheaded|directed|coordinated|executed|achieved|streamlined|optimized|launched|established|grew|drove|owned|partnered|collaborated|analyzed|resolved|supported|facilitated|transformed|negotiated|planned|oversaw|supervised|trained|mentored|architected|engineered|automated|integrated|migrated|refactored|scaled)/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const YEAR_RE = /20\d{2}|19\d{2}|present|current/i;
const PHONE_DIGITS_RE = /\d.*\d.*\d/;

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function tierFromPercent(p) {
  if (p < 50) return "red";
  if (p < 80) return "yellow";
  return "green";
}

function tierClasses(tier) {
  if (tier === "red")
    return {
      text: "text-red-700",
      stroke: "hsl(0 72% 45%)",
      bar: "bg-red-500",
      ring: "text-red-600",
      bgSoft: "bg-red-50",
    };
  if (tier === "yellow")
    return {
      text: "text-amber-800",
      stroke: "hsl(38 92% 45%)",
      bar: "bg-amber-500",
      ring: "text-amber-600",
      bgSoft: "bg-amber-50",
    };
  return {
    text: "text-emerald-800",
    stroke: "hsl(152 65% 38%)",
    bar: "bg-emerald-500",
    ring: "text-emerald-600",
    bgSoft: "bg-emerald-50",
  };
}

function scoreCompleteness(personal, experiences, educations, skills) {
  let pts = 0;
  const tips = [];

  if (personal.fullName?.trim() && personal.email?.trim()) {
    pts += 6;
  } else {
    tips.push("Add your full name and a professional email address.");
  }

  let contactExtras = 0;
  if (personal.phone?.trim() && PHONE_DIGITS_RE.test(personal.phone)) {
    contactExtras += 2;
  } else {
    tips.push("Include a phone number with digits recruiters can dial.");
  }
  if (personal.location?.trim()) contactExtras += 2;
  else tips.push("Add your location (city, state or region).");
  if (personal.linkedin?.trim()) contactExtras += 2;
  else tips.push("Add a LinkedIn URL so ATS and recruiters can verify details.");
  pts += Math.min(6, contactExtras);

  const sum = personal.summary?.trim() || "";
  if (sum.length > 80) pts += 5;
  else if (sum.length > 25) pts += 3;
  else {
    tips.push("Write a summary (a few sentences) highlighting your value proposition.");
  }

  const completeExps = experiences.filter(
    (e) => e.company?.trim() && e.jobTitle?.trim() && e.dates?.trim()
  );
  if (completeExps.length >= 1) pts += 5;
  else tips.push("Complete at least one role with company, job title, and dates.");
  if (completeExps.length >= 2) pts += 3;

  const bulletTexts = experiences.flatMap((e) =>
    (e.bullets || []).map((b) => b.trim()).filter(Boolean)
  );
  if (bulletTexts.length >= 6) pts += 4;
  else if (bulletTexts.length >= 3) pts += 2;
  else {
    tips.push("Add more achievement bullets under your roles (aim for 3+ per role).");
  }

  const eduOk = educations.some((ed) => ed.school?.trim() && ed.degree?.trim());
  if (eduOk) pts += 3;
  else tips.push("Fill in education with school and degree.");

  if (skills.length >= 5) pts += 4;
  else if (skills.length >= 3) pts += 2;
  else if (skills.length >= 1) pts += 1;
  else {
    tips.push("List at least 5 relevant skills for stronger ATS keyword coverage.");
  }

  const score = clamp(Math.round(pts), 0, 25);
  return { score, tips: [...new Set(tips)].slice(0, 5) };
}

function scoreContentQuality(personal, experiences) {
  let pts = 0;
  const tips = [];

  const bullets = experiences.flatMap((e) =>
    (e.bullets || []).map((b) => b.trim()).filter(Boolean)
  );

  if (bullets.length === 0) {
    tips.push("Add bullet points that describe impact and responsibilities.");
    return { score: 0, tips };
  }

  const verbHits = bullets.filter((b) => {
    const first = b.split(/\s+/)[0] || "";
    return ACTION_VERB_RE.test(first);
  }).length;
  const ratio = verbHits / bullets.length;
  pts += Math.round(ratio * 12);
  if (ratio < 0.5) {
    tips.push("Start more bullets with strong action verbs (e.g. Led, Built, Delivered).");
  }

  const substantive = bullets.filter((b) => b.length >= 45).length;
  if (substantive >= bullets.length * 0.5) pts += 6;
  else if (substantive > 0) pts += 3;
  else {
    tips.push("Expand bullets with specifics: scope, metrics, or outcomes.");
  }

  const hasNumber = bullets.some((b) => /\d/.test(b));
  if (hasNumber) pts += 4;
  else {
    tips.push("Quantify results where possible (%, $, time saved, team size).");
  }

  const summary = personal.summary?.trim() || "";
  if (summary.split(/\s+/).filter(Boolean).length >= 45) pts += 3;
  else if (summary.length > 0) pts += 1;

  const score = clamp(Math.round(pts), 0, 25);
  return { score, tips: [...new Set(tips)].slice(0, 5) };
}

function scoreAts(personal, experiences, educations, skills) {
  let pts = 0;
  const tips = [];

  if (personal.fullName?.trim() && personal.email?.trim() && EMAIL_RE.test(personal.email.trim())) {
    pts += 6;
  } else {
    tips.push("Use a standard email format (no typos in your address).");
  }

  if (personal.phone?.trim() && PHONE_DIGITS_RE.test(personal.phone)) pts += 4;
  else tips.push("ATS parsers expect a recognizable phone number.");

  const li = personal.linkedin?.trim() || "";
  if (li && (li.includes("linkedin.com") || /^https?:\/\//i.test(li))) pts += 4;
  else if (li) pts += 2;
  else tips.push("Add a full LinkedIn profile URL when possible.");

  if (skills.length >= 5) pts += 5;
  else if (skills.length >= 3) pts += 3;
  else tips.push("Skills act as keywords—list tools and domains clearly.");

  const hasSummary = (personal.summary?.trim() || "").length > 20;
  const hasExp = experiences.some(
    (e) => e.company?.trim() && e.jobTitle?.trim()
  );
  const hasEdu = educations.some((ed) => ed.school?.trim());
  if (hasSummary && hasExp && hasEdu && skills.length > 0) pts += 6;
  else {
    tips.push("Keep Summary, Experience, Education, and Skills populated for ATS parsing.");
  }

  const score = clamp(Math.round(pts), 0, 25);
  return { score, tips: [...new Set(tips)].slice(0, 5) };
}

function scoreFormatting(personal, experiences, educations) {
  let pts = 0;
  const tips = [];

  const name = personal.fullName?.trim() || "";
  if (name && name !== name.toUpperCase()) pts += 4;
  else if (name) {
    tips.push("Avoid ALL CAPS for your name—use title or sentence case.");
    pts += 2;
  }

  let datedExps = 0;
  for (const e of experiences) {
    if (!e.company?.trim()) continue;
    if (e.dates?.trim() && YEAR_RE.test(e.dates)) datedExps++;
    else tips.push(`Add clear dates for "${e.company.trim() || "this role"}".`);
  }
  if (datedExps > 0) pts += Math.min(8, 4 + datedExps * 2);

  const emptyBullets = experiences.some((e) =>
    (e.bullets || []).some((b) => b.trim() === "" && e.bullets.length > 1)
  );
  if (!emptyBullets) pts += 4;
  else tips.push("Remove empty bullet rows or fill them in for a cleaner export.");

  const eduDates = educations.filter((ed) => ed.dates?.trim() && YEAR_RE.test(ed.dates));
  if (educations.some((ed) => ed.school?.trim())) {
    if (eduDates.length >= educations.filter((ed) => ed.school?.trim()).length) pts += 4;
    else tips.push("Add graduation or attendance dates for education entries.");
  }

  for (const ed of educations) {
    if (ed.school?.trim() && !ed.degree?.trim()) {
      tips.push(`Specify the degree for "${ed.school.trim()}".`);
    }
  }

  if (personal.email?.trim() && !EMAIL_RE.test(personal.email.trim())) {
    tips.push("Double-check email formatting (user@domain.com).");
  }

  const score = clamp(Math.round(pts), 0, 25);
  return { score, tips: [...new Set(tips)].slice(0, 5) };
}

function computeAll(personal, experiences, educations, skills) {
  const c = scoreCompleteness(personal, experiences, educations, skills);
  const q = scoreContentQuality(personal, experiences);
  const a = scoreAts(personal, experiences, educations, skills);
  const f = scoreFormatting(personal, experiences, educations);

  const overall = clamp(c.score + q.score + a.score + f.score, 0, 100);

  const categories = [
    {
      id: "content",
      label: "Content Quality",
      max: 25,
      score: q.score,
      tips: q.tips,
    },
    {
      id: "ats",
      label: "ATS Compatibility",
      max: 25,
      score: a.score,
      tips: a.tips,
    },
    {
      id: "format",
      label: "Formatting",
      max: 25,
      score: f.score,
      tips: f.tips,
    },
    {
      id: "complete",
      label: "Completeness",
      max: 25,
      score: c.score,
      tips: c.tips,
    },
  ];

  return { overall, categories };
}

function ScoreRing({ score, strokeColor }) {
  const pct = clamp(score, 0, 100);
  const offset = C * (1 - pct / 100);

  return (
    <div className="relative mx-auto h-24 w-24 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-slate-900">{pct}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
          /100
        </span>
      </div>
    </div>
  );
}

export function ResumeScore({
  personal,
  experiences,
  educations,
  skills,
  userPlan = null,
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { overall, categories } = useMemo(() => {
    void refreshKey;
    return computeAll(personal, experiences, educations, skills);
  }, [personal, experiences, educations, skills, refreshKey]);

  const tier = tierFromPercent(overall);
  const tc = tierClasses(tier);

  return (
    <section
      className={`rounded-xl border border-slate-200 p-4 shadow-sm ${tc.bgSoft}`}
      aria-labelledby="resume-score-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id="resume-score-heading"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600"
        >
          <ClipboardCheck className="h-4 w-4 text-blue-600" aria-hidden />
          Resume score
        </h2>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
        <ScoreRing key={refreshKey} score={overall} strokeColor={tc.stroke} />
        <div className="text-center sm:text-left">
          <p className={`text-sm font-bold ${tc.text}`}>
            {tier === "red" && "Needs work"}
            {tier === "yellow" && "Getting there"}
            {tier === "green" && "Strong profile"}
          </p>
          <p className="text-xs text-slate-600">
            Heuristic score—fill sections, use action verbs, and add keywords.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-4">
        {categories.map((cat) => {
          const pct = cat.max === 0 ? 0 : Math.round((cat.score / cat.max) * 100);
          const catTier = tierFromPercent((cat.score / 25) * 100);
          const cc = tierClasses(catTier);

          return (
            <li key={cat.id} className="rounded-lg border border-slate-200/80 bg-white/80 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800">{cat.label}</span>
                <span className="text-xs tabular-nums text-slate-600">
                  {cat.score}/{cat.max}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${cc.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {cat.tips.length > 0 ? (
                <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] leading-snug text-slate-600">
                  {cat.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[11px] text-emerald-700">Looks solid for this area.</p>
              )}
            </li>
          );
        })}
      </ul>

      {userPlan != null && !isPaidPlan(userPlan) ? (
        <p className="mt-4 rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2.5 text-center text-[11px] leading-snug text-slate-700">
          <Link
            href="/#pricing"
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            Upgrade to Pro
          </Link>{" "}
          for unlimited AI, keyword scanning, every template, and more resumes.
        </p>
      ) : null}
    </section>
  );
}
