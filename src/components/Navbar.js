"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-slate-900 dark:text-white"
        >
          <BrandLogo size={36} />
          ResumeAI
        </Link>

        <div className="hidden md:flex md:items-center md:gap-5">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
            >
              {label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
          <div className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
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
