"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSupabase } from "@/lib/supabase";

const navLinks = [{ href: "/blog", label: "Blog" }];

const pricingDropdownItems = [
  {
    href: "/#pricing",
    title: "Job Seekers",
    description: "Free to get started, no card required.",
    badge: null,
  },
  {
    href: "/#pricing",
    title: "For Organizations & Consultants",
    description: "Help your job seekers with Zoru for teams.",
    badge: "New",
  },
];

const aiMegaSections = [
  {
    heading: "Resume tools",
    variant: "links",
    items: [
      {
        href: "/dashboard/resume/new",
        title: "AI resume builder",
        description: "Smart resume creation with live preview.",
        badge: null,
      },
      {
        href: "/dashboard/resume/agent",
        title: "AI resume agent",
        description: "Guided editing and AI suggestions in one workspace.",
        badge: "New!",
      },
      {
        href: "/dashboard/resume/new#resume-score-heading",
        title: "Resume checker",
        description: "Get instant feedback with your resume score.",
        badge: null,
      },
      {
        href: "/dashboard/keyword-scanner",
        title: "Resume keyword scanner",
        description: "Target your application with keyword matches.",
        badge: null,
      },
      {
        href: "/dashboard/resume/new#zoru-bullets",
        title: "Resume bullet point writer",
        description: "Stronger bullets with one-click AI.",
        badge: null,
      },
      {
        href: "/dashboard/resume/new#zoru-summary",
        title: "Resume summary generator",
        description: "Craft a clear professional summary.",
        badge: null,
      },
    ],
  },
  {
    heading: "Other tools",
    variant: "links",
    items: [
      {
        href: "/dashboard/cover-letter",
        title: "Cover letter generator",
        description: "Personalized cover letters for each role.",
        badge: null,
      },
      {
        href: "/dashboard",
        title: "Resignation letter generator",
        description: "Leave on good terms — more letter types from the dashboard.",
        badge: null,
      },
      {
        href: "/dashboard",
        title: "AI interview practice",
        description: "Practice sessions — rolling out soon in Zoru.",
        badge: "New!",
      },
      {
        href: "/dashboard",
        title: "Job search",
        description: "Discover and track roles — more coming soon.",
        badge: null,
      },
      {
        href: "/#features",
        title: "View all tools",
        description: "See the full Zoru tour on one page.",
        badge: null,
      },
    ],
  },
  {
    heading: "User guides",
    variant: "guides",
    items: [
      {
        href: "/blog",
        title: "How to tailor a resume to a job posting",
        description:
          "Tailor your resume by adding keywords from the job ad — this guide walks you through it.",
      },
      {
        href: "/blog",
        title: "How to use the resume score",
        description:
          "Understand your checklist and what moves the needle on your resume score.",
      },
    ],
  },
];

const examplesMegaSections = [
  {
    heading: "Resume examples",
    variant: "links",
    items: [
      {
        href: "/templates",
        title: "Resume templates & formats",
        description: "Explore Zoru’s most-used resume formats and layouts.",
        badge: null,
      },
      {
        href: "/blog",
        title: "Resume examples",
        description: "Get inspired by excellent resumes and ideas for your own.",
        badge: null,
      },
    ],
  },
  {
    heading: "Other examples",
    variant: "links",
    items: [
      {
        href: "/dashboard/cover-letter",
        title: "Cover letter examples",
        description: "Effective cover letter samples.",
        badge: null,
      },
      {
        href: "/blog",
        title: "Resignation letter examples",
        description: "Effective resignation letter samples.",
        badge: null,
      },
    ],
  },
  {
    heading: "Resources",
    variant: "resource",
    resource: {
      href: "/blog",
      title: "Free Google Docs resume template",
      description: "How to format a resume the right way!",
      cta: "Get the template",
    },
  },
];

function BadgePill({ children }) {
  return (
    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      {children}
    </span>
  );
}

/** Green “New!” pill next to AI Tools (Rezi-style nav). */
function NavNewBadge() {
  return (
    <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-emerald-800 dark:bg-emerald-900/85 dark:text-emerald-200">
      New!
    </span>
  );
}

function PricingNewBadge({ children }) {
  return (
    <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
      {children}
    </span>
  );
}

function PricingDropdownPanel({ onNavigate }) {
  return (
    <div
      className="w-[min(100vw-2rem,19.5rem)] rounded-xl border border-slate-200/90 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      role="menu"
      aria-label="Pricing options"
    >
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {pricingDropdownItems.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href}
              role="menuitem"
              className="block px-4 py-3 outline-none transition hover:bg-slate-50 focus-visible:bg-slate-50 dark:hover:bg-slate-800/80 dark:focus-visible:bg-slate-800/80"
              onClick={onNavigate}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </span>
                {item.badge ? (
                  <PricingNewBadge>{item.badge}</PricingNewBadge>
                ) : null}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MegaMenuPanel({
  sections,
  ariaLabel,
  onNavigate,
  columnHeadingClassName = "text-slate-500 dark:text-slate-400",
}) {
  return (
    <div
      className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      role="menu"
      aria-label={ariaLabel}
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {sections.map((col) => (
          <div key={col.heading}>
            <p
              className={`mb-3 text-[11px] font-bold uppercase tracking-wider ${columnHeadingClassName}`}
            >
              {col.heading}
            </p>
            {col.variant === "guides" ? (
              <div>
                <ul className="space-y-4">
                  {col.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        role="menuitem"
                        className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        onClick={onNavigate}
                      >
                        <div
                          className="mb-2 aspect-[16/10] w-full rounded-lg bg-gradient-to-br from-sky-100 via-white to-violet-100 shadow-inner dark:from-sky-950/80 dark:via-slate-900 dark:to-violet-950/60"
                          aria-hidden
                        />
                        <span className="text-sm font-semibold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {item.description}
                        </span>
                        <span className="mt-2 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Continue reading
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/blog"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={onNavigate}
                >
                  All user guides <span aria-hidden>→</span>
                </Link>
              </div>
            ) : col.variant === "resource" && col.resource ? (
              <div>
                <Link
                  href={col.resource.href}
                  role="menuitem"
                  className="group block rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 outline-none transition hover:border-blue-200 hover:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-900 dark:hover:bg-slate-800"
                  onClick={onNavigate}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-900"
                      aria-hidden
                    >
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      Free
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {col.resource.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {col.resource.description}
                  </span>
                  <span className="mt-3 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {col.resource.cta}
                  </span>
                </Link>
                <Link
                  href="/blog"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={onNavigate}
                >
                  All blog posts <span aria-hidden>→</span>
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {col.items.map((item) => (
                  <li key={`${col.heading}-${item.title}`}>
                    <Link
                      href={item.href}
                      role="menuitem"
                      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                      onClick={onNavigate}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {item.title}
                        </span>
                        {item.badge ? <BadgePill>{item.badge}</BadgePill> : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                        {item.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
        <Link
          href="/signup"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={onNavigate}
        >
          Create free account →
        </Link>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [open, setOpen] = useState(false);
  const [aiMegaOpen, setAiMegaOpen] = useState(false);
  const [examplesMegaOpen, setExamplesMegaOpen] = useState(false);
  const [mobileAiOpen, setMobileAiOpen] = useState(false);
  const [mobileExamplesOpen, setMobileExamplesOpen] = useState(false);
  const [mobilePricingOpen, setMobilePricingOpen] = useState(false);
  const [pricingMegaOpen, setPricingMegaOpen] = useState(false);
  const aiLeaveTimer = useRef(null);
  const examplesLeaveTimer = useRef(null);
  const pricingLeaveTimer = useRef(null);
  const aiMegaWrapRef = useRef(null);
  const examplesMegaWrapRef = useRef(null);
  const pricingMegaWrapRef = useRef(null);

  const clearAiLeave = () => {
    if (aiLeaveTimer.current) {
      clearTimeout(aiLeaveTimer.current);
      aiLeaveTimer.current = null;
    }
  };

  const clearExamplesLeave = () => {
    if (examplesLeaveTimer.current) {
      clearTimeout(examplesLeaveTimer.current);
      examplesLeaveTimer.current = null;
    }
  };

  const scheduleAiClose = () => {
    clearAiLeave();
    aiLeaveTimer.current = setTimeout(() => setAiMegaOpen(false), 120);
  };

  const scheduleExamplesClose = () => {
    clearExamplesLeave();
    examplesLeaveTimer.current = setTimeout(
      () => setExamplesMegaOpen(false),
      120
    );
  };

  const clearPricingLeave = () => {
    if (pricingLeaveTimer.current) {
      clearTimeout(pricingLeaveTimer.current);
      pricingLeaveTimer.current = null;
    }
  };

  const schedulePricingClose = () => {
    clearPricingLeave();
    pricingLeaveTimer.current = setTimeout(
      () => setPricingMegaOpen(false),
      120
    );
  };

  const openAiMega = () => {
    clearAiLeave();
    setExamplesMegaOpen(false);
    clearExamplesLeave();
    setPricingMegaOpen(false);
    clearPricingLeave();
    setAiMegaOpen(true);
  };

  const openExamplesMega = () => {
    clearExamplesLeave();
    setAiMegaOpen(false);
    clearAiLeave();
    setPricingMegaOpen(false);
    clearPricingLeave();
    setExamplesMegaOpen(true);
  };

  const openPricingMega = () => {
    clearPricingLeave();
    setAiMegaOpen(false);
    clearAiLeave();
    setExamplesMegaOpen(false);
    clearExamplesLeave();
    setPricingMegaOpen(true);
  };

  useEffect(() => {
    return () => {
      clearAiLeave();
      clearExamplesLeave();
      clearPricingLeave();
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!aiMegaOpen && !examplesMegaOpen && !pricingMegaOpen) return;
    function onKey(e) {
      if (e.key === "Escape") {
        setAiMegaOpen(false);
        setExamplesMegaOpen(false);
        setPricingMegaOpen(false);
      }
    }
    function onPointerDown(e) {
      const inAi =
        aiMegaWrapRef.current && aiMegaWrapRef.current.contains(e.target);
      const inEx =
        examplesMegaWrapRef.current &&
        examplesMegaWrapRef.current.contains(e.target);
      const inPricing =
        pricingMegaWrapRef.current &&
        pricingMegaWrapRef.current.contains(e.target);
      if (!inAi) setAiMegaOpen(false);
      if (!inEx) setExamplesMegaOpen(false);
      if (!inPricing) setPricingMegaOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [aiMegaOpen, examplesMegaOpen, pricingMegaOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <Link
          href={isAuthed ? "/dashboard" : "/"}
          className="shrink-0 text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Zoru
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1 lg:gap-x-1">
          <Link
            href="/dashboard/resume/new"
            className="rounded px-2 py-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
          >
            AI Resume Builder
          </Link>
          <div
            ref={aiMegaWrapRef}
            className="relative flex items-center"
            onMouseEnter={openAiMega}
            onMouseLeave={scheduleAiClose}
          >
            <button
              type="button"
              className={`flex items-center gap-1 rounded px-2 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                aiMegaOpen
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
              }`}
              aria-expanded={aiMegaOpen}
              aria-haspopup="true"
              onFocus={openAiMega}
              onClick={() => {
                setExamplesMegaOpen(false);
                setPricingMegaOpen(false);
                setAiMegaOpen((v) => !v);
              }}
            >
              AI tools
              <NavNewBadge />
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition ${aiMegaOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {aiMegaOpen ? (
              <div
                className="absolute left-1/2 top-full z-50 w-[min(100vw-2rem,68rem)] -translate-x-1/2 pt-2"
                onMouseEnter={openAiMega}
                onMouseLeave={scheduleAiClose}
              >
                <MegaMenuPanel
                  sections={aiMegaSections}
                  ariaLabel="AI tools"
                  onNavigate={() => setAiMegaOpen(false)}
                />
              </div>
            ) : null}
          </div>

          <div
            ref={examplesMegaWrapRef}
            className="relative flex items-center"
            onMouseEnter={openExamplesMega}
            onMouseLeave={scheduleExamplesClose}
          >
            <button
              type="button"
              className={`flex items-center gap-0.5 rounded px-2 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                examplesMegaOpen
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
              }`}
              aria-expanded={examplesMegaOpen}
              aria-haspopup="true"
              onFocus={openExamplesMega}
              onClick={() => {
                setAiMegaOpen(false);
                setPricingMegaOpen(false);
                setExamplesMegaOpen((v) => !v);
              }}
            >
              Examples &amp; templates
              <ChevronDown
                className={`h-4 w-4 transition ${examplesMegaOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {examplesMegaOpen ? (
              <div
                className="absolute left-1/2 top-full z-50 w-[min(100vw-2rem,68rem)] -translate-x-1/2 pt-2"
                onMouseEnter={openExamplesMega}
                onMouseLeave={scheduleExamplesClose}
              >
                <MegaMenuPanel
                  sections={examplesMegaSections}
                  ariaLabel="Examples and templates"
                  columnHeadingClassName="text-blue-600 dark:text-blue-400"
                  onNavigate={() => setExamplesMegaOpen(false)}
                />
              </div>
            ) : null}
          </div>

          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded px-2 py-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
            >
              {label}
            </Link>
          ))}

          <div
            ref={pricingMegaWrapRef}
            className="relative flex items-center"
            onMouseEnter={openPricingMega}
            onMouseLeave={schedulePricingClose}
          >
            <button
              type="button"
              className={`flex items-center gap-0.5 rounded px-2 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                pricingMegaOpen
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
              }`}
              aria-expanded={pricingMegaOpen}
              aria-haspopup="true"
              onFocus={openPricingMega}
              onClick={() => {
                setAiMegaOpen(false);
                setExamplesMegaOpen(false);
                setPricingMegaOpen((v) => !v);
              }}
            >
              Pricing
              <ChevronDown
                className={`h-4 w-4 transition ${pricingMegaOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {pricingMegaOpen ? (
              <div
                className="absolute left-0 top-full z-50 pt-2"
                onMouseEnter={openPricingMega}
                onMouseLeave={schedulePricingClose}
              >
                <PricingDropdownPanel
                  onNavigate={() => setPricingMegaOpen(false)}
                />
              </div>
            ) : null}
          </div>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-1 md:flex">
          {isAuthed ? (
            <>
              <Link
                href="/dashboard"
                className="rounded px-2 py-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/resume/new"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-4"
              >
                New resume
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded px-2 py-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-4"
              >
                Create free resume
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-200"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard/resume/new"
              className="py-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
              onClick={() => setOpen(false)}
            >
              AI Resume Builder
            </Link>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 py-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200"
              aria-expanded={mobileAiOpen}
              onClick={() => {
                setMobileExamplesOpen(false);
                setMobilePricingOpen(false);
                setMobileAiOpen((v) => !v);
              }}
            >
              <span className="flex items-center gap-2">
                AI tools
                <NavNewBadge />
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition ${mobileAiOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileAiOpen ? (
              <div className="ml-1 space-y-4 border-l-2 border-blue-100 py-2 pl-3 dark:border-blue-900/40">
                {aiMegaSections.map((col) => (
                  <div key={col.heading}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {col.heading}
                    </p>
                    {col.variant === "guides" ? (
                      <ul className="space-y-3">
                        {col.items.map((item) => (
                          <li key={item.title}>
                            <Link
                              href={item.href}
                              className="block rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/50"
                              onClick={() => {
                                setOpen(false);
                                setMobileAiOpen(false);
                              }}
                            >
                              <span className="font-medium text-slate-900 dark:text-white">
                                {item.title}
                              </span>
                              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                                {item.description}
                              </span>
                              <span className="mt-2 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                                Continue reading
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-2">
                        {col.items.map((item) => (
                          <li key={`${col.heading}-${item.title}`}>
                            <Link
                              href={item.href}
                              className="block text-sm text-slate-700 dark:text-slate-300"
                              onClick={() => {
                                setOpen(false);
                                setMobileAiOpen(false);
                              }}
                            >
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {item.title}
                                </span>
                                {item.badge ? (
                                  <BadgePill>{item.badge}</BadgePill>
                                ) : null}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-500">
                                {item.description}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {col.variant === "guides" ? (
                      <Link
                        href="/blog"
                        className="mt-2 inline-flex text-xs font-semibold text-blue-600 dark:text-blue-400"
                        onClick={() => {
                          setOpen(false);
                          setMobileAiOpen(false);
                        }}
                      >
                        All user guides →
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200"
              aria-expanded={mobileExamplesOpen}
              onClick={() => {
                setMobileAiOpen(false);
                setMobilePricingOpen(false);
                setMobileExamplesOpen((v) => !v);
              }}
            >
              Examples &amp; templates
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition ${mobileExamplesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileExamplesOpen ? (
              <div className="ml-1 space-y-4 border-l-2 border-blue-100 py-2 pl-3 dark:border-blue-900/40">
                {examplesMegaSections.map((col) => (
                  <div key={col.heading}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {col.heading}
                    </p>
                    {col.variant === "resource" && col.resource ? (
                      <div>
                        <Link
                          href={col.resource.href}
                          className="block rounded-lg border border-slate-200 bg-slate-50/90 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/50"
                          onClick={() => {
                            setOpen(false);
                            setMobileExamplesOpen(false);
                          }}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                              Free
                            </span>
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {col.resource.title}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                            {col.resource.description}
                          </span>
                          <span className="mt-2 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {col.resource.cta}
                          </span>
                        </Link>
                        <Link
                          href="/blog"
                          className="mt-2 inline-flex text-xs font-semibold text-blue-600 dark:text-blue-400"
                          onClick={() => {
                            setOpen(false);
                            setMobileExamplesOpen(false);
                          }}
                        >
                          All blog posts →
                        </Link>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {col.items.map((item) => (
                          <li key={`${col.heading}-${item.title}`}>
                            <Link
                              href={item.href}
                              className="block text-sm text-slate-700 dark:text-slate-300"
                              onClick={() => {
                                setOpen(false);
                                setMobileExamplesOpen(false);
                              }}
                            >
                              <span className="font-medium text-slate-900 dark:text-white">
                                {item.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-500">
                                {item.description}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200"
              aria-expanded={mobilePricingOpen}
              onClick={() => {
                setMobileAiOpen(false);
                setMobileExamplesOpen(false);
                setMobilePricingOpen((v) => !v);
              }}
            >
              Pricing
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition ${mobilePricingOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobilePricingOpen ? (
              <div className="ml-1 space-y-2 border-l-2 border-blue-100 py-2 pl-3 dark:border-blue-900/40">
                {pricingDropdownItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="block rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50"
                    onClick={() => {
                      setOpen(false);
                      setMobilePricingOpen(false);
                    }}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      {item.badge ? (
                        <PricingNewBadge>{item.badge}</PricingNewBadge>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}

            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            {isAuthed ? (
              <>
                <Link
                  href="/dashboard"
                  className="py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/resume/new"
                  className="mt-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  New resume
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="mt-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  Create free resume
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
