"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResumeThumbnail } from "@/components/templates/ResumeThumbnail";
import { templateMap, normalizeTemplateId } from "@/components/templates";
import { normalizeResumeContent } from "@/lib/resumeContent";
import { Star, FileText, Check, Sparkles, Type } from "lucide-react";

const DEMO_RAW = {
  personal: {
    fullName: "Jordan Lee",
    email: "jordan.lee@email.com",
    phone: "+1 555 0142",
    location: "Seattle, WA",
    linkedin: "linkedin.com/in/jordanlee",
    summary:
      "Product-led engineer focused on reliable delivery, clear stakeholder communication, and measurable outcomes across B2B SaaS teams.",
  },
  experiences: [
    {
      id: "e1",
      company: "Northwind Labs",
      jobTitle: "Senior Product Manager",
      dates: "2021 — Present",
      roleDescription: "",
      bullets: [
        "Owned roadmap for onboarding and activation; lifted trial-to-paid by 18%.",
        "Partnered with design and data to ship experiments across 40k+ monthly users.",
      ],
    },
    {
      id: "e2",
      company: "Apex Systems",
      jobTitle: "Product Manager",
      dates: "2017 — 2021",
      roleDescription: "",
      bullets: [
        "Launched integrations marketplace; shortened sales cycle for mid-market deals.",
      ],
    },
  ],
  educations: [
    {
      id: "ed1",
      school: "State University",
      degree: "M.S. Information Systems",
      dates: "2016",
    },
  ],
  skills: ["SQL", "Roadmapping", "Stakeholder mgmt", "Figma", "ATS writing"],
};

const DEMO = normalizeResumeContent(DEMO_RAW);

function StarRating({ value = 5, max = 5 }) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="font-semibold text-blue-600 dark:text-blue-400">
        Recommended:
      </span>
      <span className="flex" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < value
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
            }`}
          />
        ))}
      </span>
    </p>
  );
}

function LargeResumePreview({ template }) {
  const id = normalizeTemplateId(template);
  const Template = templateMap[id] ?? templateMap.modern;
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-100 to-white shadow-xl dark:border-slate-600 dark:from-slate-800 dark:to-slate-900">
      <div className="max-h-[min(68vh,520px)] overflow-y-auto overscroll-contain">
        <div className="inline-block min-w-full p-4 sm:p-6">
          <div className="origin-top scale-[0.5] sm:scale-[0.55] md:scale-[0.6]">
            <div className="w-[8.5in] bg-white px-8 py-8 text-slate-900 shadow-md print:shadow-none">
              <Template
                personal={DEMO.personal}
                experiences={DEMO.experiences}
                educations={DEMO.educations}
                skills={DEMO.skills}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Renders strings with **phrase** as bold spans. */
function Desc({ children }) {
  if (typeof children !== "string") return children;
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\*\*([^*]+)\*\*$/.exec(part);
        if (m) {
          return (
            <strong key={i} className="font-semibold text-slate-800 dark:text-slate-200">
              {m[1]}
            </strong>
          );
        }
        return part ? <span key={i}>{part}</span> : null;
      })}
    </>
  );
}

function TemplateCard({
  templateId,
  title,
  description,
  stars,
  topAccentClass,
}) {
  return (
    <article
      className={`flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
        topAccentClass ?? ""
      }`}
    >
      <div
        className={
          topAccentClass
            ? `-mx-4 -mt-4 mb-1 overflow-hidden rounded-t-xl border-b border-slate-100 px-4 pb-4 pt-4 dark:border-slate-700`
            : ""
        }
      >
        <ResumeThumbnail template={templateId} content={DEMO} />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        <Desc>{description}</Desc>
      </p>
      <StarRating value={stars} />
      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/dashboard/resume/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Customize template in AI builder
        </Link>
        <Link
          href="/signup"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-900 dark:bg-slate-950 dark:text-blue-300 dark:hover:bg-slate-800"
        >
          <FileText className="h-4 w-4 shrink-0" aria-hidden />
          Download as Word doc template
        </Link>
      </div>
    </article>
  );
}

function GallerySection({
  id: sectionId,
  eyebrow,
  title,
  description,
  learnMoreHref,
  learnMoreLabel,
  children,
}) {
  return (
    <section
      id={sectionId}
      className="scroll-mt-24 border-b border-slate-100 py-14 sm:py-16 dark:border-slate-800"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
          {learnMoreLabel ? (
            <Link
              href={learnMoreHref}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {learnMoreLabel}
            </Link>
          ) : null}
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </section>
  );
}

function SplitFeature({
  id: sectionId,
  eyebrow,
  title,
  children,
  body,
  ctaHref,
  ctaLabel,
  reverse,
  visual,
}) {
  return (
    <section
      id={sectionId}
      className="scroll-mt-24 border-b border-slate-100 py-14 sm:py-20 dark:border-slate-800"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className={reverse ? "lg:order-2" : undefined}>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {title}
            </h2>
            <div className="mt-4 text-slate-600 dark:text-slate-400">{body}</div>
            {children}
            <Link
              href={ctaHref}
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {ctaLabel}
            </Link>
          </div>
          <div
            className={`relative min-h-[280px] ${reverse ? "lg:order-1" : ""}`}
          >
            {visual}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800/80">
      <div className="flex min-h-[320px]">
        <div className="hidden w-36 shrink-0 flex-col border-r border-slate-200 bg-slate-900 p-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:flex dark:border-slate-700">
          <div className="mb-4 text-white">Zoru</div>
          <div className="mb-2 rounded bg-blue-600 px-2 py-1.5 text-center text-white">
            New resume
          </div>
          <div className="space-y-2 pl-1">
            <div>Dashboard</div>
            <div>AI tools</div>
            <div>Library</div>
          </div>
        </div>
        <div className="flex-1 bg-slate-50 p-4 dark:bg-slate-900/40">
          <div className="mb-3 flex gap-2">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              Resume
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Cover letter
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800"
              />
            ))}
          </div>
          <div className="mx-auto -mt-16 max-w-xs rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-600 dark:bg-slate-900 sm:-mt-20">
            <ResumeThumbnail template="modern" content={DEMO} />
            <p className="mt-2 px-1 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
              Preview · My first resume
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TemplatesMarketingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* 1 — Hero */}
        <section
          id="templates-hero"
          className="scroll-mt-20 bg-gradient-to-r from-violet-950 via-indigo-900 to-blue-700 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
              The best ATS-friendly resume templates of 2026
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
              Don&apos;t start from scratch. Use a template that guides you.
              Zoru&apos;s ATS-conscious layouts help you submit cleanly parsed
              resumes hiring teams can read fast.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
              <Link
                href="#export-flex"
                className="rounded bg-blue-500 px-2 py-0.5 font-medium text-white transition hover:bg-blue-400"
              >
                Download blank versions
              </Link>{" "}
              to edit offline, or let Zoru&apos;s AI write strong bullet points
              for you in the builder.
            </p>
          </div>
        </section>

        {/* 2 — Newest */}
        <GallerySection
          id="section-newest"
          eyebrow="Latest arrivals"
          title="Newest resume templates [2026 collection]"
          description="Fresh layouts that follow current design trends while staying readable for both humans and applicant tracking systems. Pick a format, then personalize in minutes."
          learnMoreHref="#formats-guide"
          learnMoreLabel="Learn more about ATS formats"
        >
          <TemplateCard
            templateId="classic"
            title="Harvard-style classic"
            stars={5}
            description="A structured, conservative layout that reads like the **Harvard / consulting** resume candidates use for finance and strategy roles. Crisp sections and tight typography."
          />
          <TemplateCard
            templateId="modern"
            title="Builder standard"
            stars={5}
            description="Our default **modern** layout—great for **software and product** roles. Balanced hierarchy, room for impact bullets, and skills that scan well in ATS."
          />
          <TemplateCard
            templateId="creative"
            title="Highlight accent"
            stars={5}
            description="Controlled **color accents** without noisy graphics—ideal for **creative and growth** roles where you still need reliable parsing."
          />
        </GallerySection>

        {/* 3 — Simple & professional */}
        <GallerySection
          id="section-simple"
          eyebrow="Recruiter favorites"
          title="Simple & professional resume templates"
          description="Clean, low-noise formats that read well in conservative industries—finance, law, and public sector. We privilege clarity over decoration."
          learnMoreHref="#formats-guide"
          learnMoreLabel="Learn more about simple templates"
        >
          <TemplateCard
            templateId="classic"
            title="Standard"
            stars={5}
            description="Reverse-chronological template designed for **maximum readability** in corporate and government pipelines."
          />
          <TemplateCard
            templateId="modern"
            title="Simple"
            stars={5}
            description="A **minimal** layout with strong spacing—fits **experienced** hires who want facts, not fluff."
          />
          <TemplateCard
            templateId="classic"
            title="Basic"
            stars={5}
            description="A **traditional** structure—fully ATS-minded—for law, finance, and risk-averse hiring managers."
          />
        </GallerySection>

        {/* 4 — Modern / tech */}
        <GallerySection
          id="section-modern"
          eyebrow="Tech & startup ready"
          title="Modern resume templates"
          description="Sleek designs that suit technology and fast-moving teams. Highlight impact, tools, and scope without sacrificing scanability."
          learnMoreHref="#formats-guide"
          learnMoreLabel="Learn more about modern templates"
        >
          <TemplateCard
            templateId="modern"
            title="Modern"
            stars={5}
            description="Tech-forward hierarchy with clear sections for **skills and impact**—built for engineers, PMs, and IT leaders."
          />
          <TemplateCard
            templateId="modern"
            title="Smart"
            stars={4}
            description="Linear story for **steady progression**—great for managers showing a clear climb from IC to lead."
          />
          <TemplateCard
            templateId="classic"
            title="Neat"
            stars={3}
            description="Straightforward blocks for **large employers** where conservative parsing beats flashy layout."
          />
        </GallerySection>

        {/* 5 — Creative */}
        <GallerySection
          id="section-creative"
          eyebrow="For design & marketing"
          title="Creative resume templates"
          description="Stand out with tasteful accents while keeping text machine-readable. Built for marketing, content, and brand-facing roles."
          learnMoreHref="#formats-guide"
          learnMoreLabel="Learn more about creative templates"
        >
          <TemplateCard
            templateId="creative"
            title="Bold"
            stars={5}
            topAccentClass="border-t-4 border-blue-500 pt-0"
            description="Strong header strip with confident typography—use when your **brand voice** matters."
          />
          <TemplateCard
            templateId="creative"
            title="Accent"
            stars={4}
            topAccentClass="border-t-4 border-rose-500 pt-0"
            description="Color accents guide the eye to **projects and outcomes** without heavy graphics."
          />
          <TemplateCard
            templateId="creative"
            title="Bright"
            stars={4}
            topAccentClass="border-t-4 border-amber-500 pt-0"
            description="Warm highlights for **portfolio-driven** profiles—still text-first for ATS."
          />
        </GallerySection>

        {/* 6 — Compact */}
        <GallerySection
          id="section-compact"
          eyebrow="High-density layouts"
          title="Compact resume templates"
          description="Designed to fit extensive experience on one page when you need density without clutter—senior ICs and managers juggling many roles."
          learnMoreHref="#formats-guide"
          learnMoreLabel="Learn more about compact templates"
        >
          <TemplateCard
            templateId="classic"
            title="Compact"
            stars={5}
            description="Tighter vertical rhythm to **pack achievements** while preserving section breaks."
          />
          <TemplateCard
            templateId="modern"
            title="Maximum"
            stars={5}
            description="Balances **two-column feel** in a single flow—skills and impact side by side."
          />
          <TemplateCard
            templateId="classic"
            title="Structured"
            stars={5}
            description="Grid-like clarity for **compliance-minded** readers who expect predictable order."
          />
        </GallerySection>

        {/* 7 — Methodology */}
        <SplitFeature
          id="methodology"
          eyebrow="Proven methodology"
          title="Recruiter-approved resume formats"
          body={
            <p>
              Avoid pretty templates that confuse parsers. Zoru formats prioritize{" "}
              <strong className="font-semibold text-blue-600 dark:text-blue-400">
                ATS compatibility
              </strong>
              , standard section labels, and fast human scan—so hiring managers
              see your strengths immediately.
            </p>
          }
          ctaHref="/dashboard/resume/new"
          ctaLabel="Create your resume now"
          visual={
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800/60">
              <div className="rotate-[-2deg] rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-600 dark:bg-slate-900">
                <ResumeThumbnail template="modern" content={DEMO} />
                <p className="mt-2 text-center text-xs text-slate-500">
                  Live layout · My first resume
                </p>
              </div>
            </div>
          }
        />

        {/* 8 — AI fill */}
        <SplitFeature
          id="ai-fill"
          eyebrow="Instant content generation"
          title="Auto-fill your template with AI"
          body={
            <p>
              Stuck on wording? In the builder, Zoru can suggest summaries and
              bullet points tuned to your role so you&apos;re not staring at a
              blank page.
            </p>
          }
          ctaHref="/dashboard/resume/new"
          ctaLabel="Create your resume now"
          reverse
          visual={
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-600 dark:bg-slate-900">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  AI keyword tailoring
                </p>
                <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  Product analyst
                </span>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  We&apos;ve drafted a stronger bullet for your experience.
                </p>
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Sr. Analyst · Northwind · 2021—Present
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <span className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
                    <Check className="h-3.5 w-3.5" aria-hidden /> Accept &amp;
                    next
                  </span>
                  <span className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:text-blue-300">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> Rewrite
                    bullet
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full text-center text-xs font-medium text-slate-500 dark:text-slate-400"
                >
                  Skip
                </button>
              </div>
            </div>
          }
        />

        {/* 9 — Word & PDF */}
        <SplitFeature
          id="export-flex"
          eyebrow="Total flexibility"
          title="Fully customizable for Word & PDF"
          body={
            <p>
              Adjust sections and phrasing in Zoru, then{" "}
              <Link
                href="/dashboard/resume/new"
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                download a print-perfect PDF
              </Link>{" "}
              from the editor. Word-style offline edits are on our roadmap—PDF
              export is ready today.
            </p>
          }
          ctaHref="/dashboard/resume/new"
          ctaLabel="Create your resume now"
          visual={
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-600 dark:bg-slate-900">
              <div className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                <Type className="h-4 w-4 text-slate-500" aria-hidden />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Format · Fonts · Sections
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {["Summary tuned to role", "Impact bullets reviewed", "Skills aligned to posting"].map(
                  (t) => (
                    <li
                      key={t}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
                    >
                      {t}
                      <Check className="h-4 w-4 text-blue-600" aria-hidden />
                    </li>
                  )
                )}
              </ul>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-600 dark:bg-slate-800">
                <span className="text-slate-500">Font</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  Merriweather · 10.5 pt
                </p>
              </div>
            </div>
          }
        />

        {/* 9A — Classic spotlight */}
        <section
          id="spotlight-classic"
          className="scroll-mt-24 border-b border-slate-100 py-14 dark:border-slate-800"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-12 lg:px-8">
            <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <ResumeThumbnail template="classic" content={DEMO} />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Just use this template
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Your application-ready resume comes together in minutes inside
                the builder.
              </p>
              <StarRating value={5} />
              <Link
                href="/dashboard/resume/new"
                className="mt-4 flex w-full justify-center rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Use this template
              </Link>
            </aside>
            <LargeResumePreview template="classic" />
          </div>
        </section>

        {/* 9B — Hybrid explainer */}
        <section
          id="spotlight-hybrid"
          className="scroll-mt-24 border-b border-slate-100 py-14 dark:border-slate-800"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-12 lg:px-8">
            <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <ResumeThumbnail template="modern" content={DEMO} />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Just use this template
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Your application-ready resume will write itself in minutes with
                AI assist.
              </p>
              <StarRating value={5} />
              <Link
                href="/dashboard/resume/new"
                className="mt-4 flex w-full justify-center rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-slate-600 dark:text-blue-300 dark:hover:bg-slate-800"
              >
                Use this template
              </Link>
            </aside>
            <div>
              <LargeResumePreview template="modern" />
              <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Hybrid resume template (combination)
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Blends a strong snapshot of skills with a detailed work
                  history—great when you have depth to show but still want
                  recruiters to see your focus quickly.
                </p>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">
                      Best for:
                    </strong>{" "}
                    Senior professionals with broad skill sets.
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">
                      Try in Zoru:
                    </strong>{" "}
                    Modern &amp; Classic layouts in the editor.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 9C — Linear / serif-friendly */}
        <section
          id="spotlight-linear"
          className="scroll-mt-24 border-b border-slate-100 py-14 dark:border-slate-800"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-12 lg:px-8">
            <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <ResumeThumbnail template="classic" content={DEMO} />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Just use this template
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Single-column flow with clear dividers—ideal for conservative
                readers and dense career histories.
              </p>
              <StarRating value={5} />
              <Link
                href="/dashboard/resume/new"
                className="mt-4 flex w-full justify-center rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              >
                Use this template
              </Link>
            </aside>
            <LargeResumePreview template="classic" />
          </div>
        </section>

        {/* 9D — ATS + Word vs PDF */}
        <section
          id="formats-guide"
          className="scroll-mt-24 border-b border-slate-100 py-14 dark:border-slate-800"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start lg:gap-12 lg:px-8">
            <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <ResumeThumbnail template="modern" content={DEMO} />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Just use this template
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Start from a proven structure—then tune content with AI and
                export PDF when you&apos;re ready.
              </p>
              <StarRating value={5} />
              <Link
                href="/dashboard/resume/new"
                className="mt-4 flex w-full justify-center rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-slate-600 dark:text-blue-300 dark:hover:bg-slate-800"
              >
                Use this template
              </Link>
            </aside>
            <div className="max-w-none text-slate-800 dark:text-slate-200">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Why ATS-friendly templates matter
              </h3>
              <div className="mt-3 rounded-lg bg-blue-50 p-4 text-sm leading-relaxed text-slate-800 dark:bg-blue-950/40 dark:text-slate-200">
                Many employers filter resumes electronically first. Busy
                graphics, odd column layouts, and text baked into images can
                reduce match scores. Zoru templates stay text-first with
                conventional headings.
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                We use standard fonts and sensible margins so your sections map
                cleanly to what parsers expect—without looking bland to humans.
              </p>
              <h3 className="mt-10 text-lg font-bold text-slate-900 dark:text-white">
                Word vs PDF: which should you use?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Many job forms accept both. Each has tradeoffs:
              </p>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-900 dark:text-white">
                    PDF (recommended from Zoru):
                  </strong>{" "}
                  Locks in formatting when you export from the preview—great for
                  email applications and consistency.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">
                    Microsoft Word (DOCX):
                  </strong>{" "}
                  Some legacy portals still request Word. You can copy content
                  out of Zoru into Word if needed; native DOCX export is planned.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 9E — Closing CTA */}
        <section
          id="get-started"
          className="scroll-mt-24 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Your resume, perfectly formatted in minutes
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Pick a template, draft with AI, and keep everything in one place
              with Zoru—then export when you&apos;re ready to apply.
            </p>
            <Link
              href="/dashboard/resume/new"
              className="mt-8 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Create your resume
            </Link>
          </div>
          <div className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
            <DashboardMock />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}