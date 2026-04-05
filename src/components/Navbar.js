"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
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
        href: "/dashboard/resume/new",
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

function BadgePill({ children }) {
  return (
    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      {children}
    </span>
  );
}

function MegaMenuPanel({ onNavigate }) {
  return (
    <div
      className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      role="menu"
      aria-label="AI tools"
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {aiMegaSections.map((col) => (
          <div key={col.heading}>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileAiOpen, setMobileAiOpen] = useState(false);
  const leaveTimer = useRef(null);
  const megaWrapRef = useRef(null);

  const clearLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearLeave();
    leaveTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const openMega = () => {
    clearLeave();
    setMegaOpen(true);
  };

  useEffect(() => {
    return () => clearLeave();
  }, []);

  useEffect(() => {
    if (!megaOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setMegaOpen(false);
    }
    function onPointerDown(e) {
      if (megaWrapRef.current && !megaWrapRef.current.contains(e.target)) {
        setMegaOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [megaOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          Zoru
        </Link>

        <div className="hidden md:flex md:items-center md:gap-1">
          <div
            ref={megaWrapRef}
            className="relative flex items-center"
            onMouseEnter={openMega}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={`flex items-center gap-0.5 rounded px-2 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                megaOpen
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
              }`}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onFocus={openMega}
              onClick={() => setMegaOpen((v) => !v)}
            >
              AI tools
              <ChevronDown
                className={`h-4 w-4 transition ${megaOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {megaOpen ? (
              <div
                className="absolute left-1/2 top-full z-50 w-[min(100vw-2rem,68rem)] -translate-x-1/2 pt-2"
                onMouseEnter={openMega}
                onMouseLeave={scheduleClose}
              >
                <MegaMenuPanel onNavigate={() => setMegaOpen(false)} />
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

          <Link
            href="/login"
            className="rounded px-2 py-2 text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="ml-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get started
          </Link>
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
            <button
              type="button"
              className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200"
              aria-expanded={mobileAiOpen}
              onClick={() => setMobileAiOpen((v) => !v)}
            >
              AI tools
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
            <Link
              href="/login"
              className="py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="mt-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
