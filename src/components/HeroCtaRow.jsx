"use client";

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase";

function ScoreGauge({ gradId }) {
  return (
    <div
      className="relative flex h-16 w-[5.25rem] shrink-0 flex-col items-center justify-end sm:h-[4.5rem]"
      aria-hidden
    >
      <svg viewBox="0 0 88 52" className="h-full w-full">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
        <path
          d="M 12 44 A 40 40 0 0 1 76 44"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute bottom-1 flex flex-col items-center leading-none">
        <span className="text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
          0
        </span>
        <span className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Zoru score
        </span>
      </div>
    </div>
  );
}

/** Rezi-style row: solid primary CTA + dashed import zone, equal height, ~18px gap. */
export function HeroCtaRow({ className = "" }) {
  const router = useRouter();
  const gradId = useId().replace(/:/g, "");
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const goAfterFile = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        toast.success(
          "Opening the editor — add your details or paste from your file."
        );
        router.push("/dashboard/resume/new");
        return;
      }
    } catch {
      // fall through to signup
    }
    toast.success("Create a free account to import and edit your resume.");
    router.push("/signup?next=/dashboard/resume/new");
  }, [router]);

  const onPick = useCallback(
    (files) => {
      const f = files?.[0];
      if (!f) return;
      const ok = /\.(pdf|docx?|txt)$/i.test(f.name);
      if (!ok) {
        toast.error("Please use a PDF, Word (.doc, .docx), or .txt file.");
        return;
      }
      void goAfterFile();
    },
    [goAfterFile]
  );

  const ctaHeight =
    "min-h-[4.5rem] h-auto sm:min-h-[5rem] sm:h-[5rem] sm:max-h-[5rem]";

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-start sm:gap-[18px] ${className}`.trim()}
    >
      <Link
        href="/signup"
        className={`group inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-7 text-center text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 ${ctaHeight} w-full sm:w-[min(46%,14.5rem)] sm:min-w-[13.5rem]`}
      >
        Get started—it&apos;s free
      </Link>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onPick(e.dataTransfer?.files);
        }}
        className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-fit sm:max-w-full sm:shrink-0 sm:px-5 ${ctaHeight} ${
          dragOver
            ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/90 dark:border-slate-500 dark:bg-slate-950 dark:hover:border-slate-400 dark:hover:bg-slate-900/80"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => {
            onPick(e.target.files);
            e.target.value = "";
          }}
        />
        <ScoreGauge gradId={gradId} />
        <div className="min-w-0 shrink py-0.5 sm:pr-1">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            Import your resume
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Click or drop your resume to start
          </p>
        </div>
      </button>
    </div>
  );
}
