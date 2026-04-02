"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase";

function ScoreGauge() {
  return (
    <div
      className="relative flex h-[4.5rem] w-[5.25rem] shrink-0 flex-col items-center justify-end"
      aria-hidden
    >
      <svg viewBox="0 0 88 52" className="h-full w-full">
        <defs>
          <linearGradient id="heroGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
        <path
          d="M 12 44 A 40 40 0 0 1 76 44"
          fill="none"
          stroke="url(#heroGaugeGrad)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute bottom-1 flex flex-col items-center leading-none">
        <span className="text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
          0
        </span>
        <span className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          ResumeAI score
        </span>
      </div>
    </div>
  );
}

export function HeroCtaRow({ className = "" }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const goAfterFile = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        toast.success("Opening the editor — add your details or paste from your file.");
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

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3 ${className}`.trim()}
    >
      <Link
        href="/signup"
        className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:shadow-blue-900/40 sm:min-w-0 sm:flex-1"
      >
        Get started—it&apos;s free
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
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
        className={`flex min-h-[5.25rem] flex-1 cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-3 py-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:gap-4 sm:px-4 ${
          dragOver
            ? "border-blue-500 bg-blue-50/90 shadow-inner shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-950/50"
            : "border-slate-300/90 bg-slate-50/50 hover:border-slate-400 hover:bg-white/90 dark:border-slate-600 dark:bg-slate-950/40 dark:hover:border-slate-500 dark:hover:bg-slate-900/70"
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
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              dragOver
                ? "bg-blue-600 text-white"
                : "bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <UploadCloud className="h-5 w-5" aria-hidden />
          </div>
          <ScoreGauge />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
            Import your resume
          </p>
          <p className="mt-0.5 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            Click or drop PDF, Word, or .txt
          </p>
        </div>
      </button>
    </div>
  );
}
