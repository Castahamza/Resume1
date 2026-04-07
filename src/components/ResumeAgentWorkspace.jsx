"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Crosshair,
  FileText,
  History,
  Plus,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export function ResumeAgentWorkspace() {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  function handleNewChat() {
    setMessage("");
    toast.success("Started a new chat.");
  }

  function handleRecentChats() {
    toast("Chat history will appear here soon.", { icon: "💬" });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Type a question or use a quick action above.");
      return;
    }
    toast.success(
      "Thanks — the AI agent is getting smarter. Full replies are coming soon."
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0a0c10]">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={handleRecentChats}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-[#141821] px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-200 transition hover:border-white/30 hover:bg-white/5"
        >
          <History className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          Recent chats
        </button>
        <button
          type="button"
          onClick={handleNewChat}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c4b5fd] px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-900 shadow-sm transition hover:bg-[#b4a3fc]"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New chat
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10 sm:py-14">
        <h1 className="max-w-xl text-center text-2xl font-semibold leading-snug tracking-tight text-white sm:max-w-2xl sm:text-[1.65rem] sm:leading-snug">
          How can AI Resume Agent help with your resume and job search?
        </h1>

        <div className="mt-8 flex max-w-2xl flex-wrap justify-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/resume/new#resume-score-heading"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#141821] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/5"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-300" aria-hidden />
            Improve my Zoru score
          </Link>
          <Link
            href="/dashboard/keyword-scanner"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#141821] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/5"
          >
            <Crosshair className="h-3.5 w-3.5 text-sky-300" aria-hidden />
            Target my resume
          </Link>
          <button
            type="button"
            onClick={() =>
              toast("Job discovery is on the roadmap — stay tuned.", {
                icon: "🧭",
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#141821] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/5"
          >
            <FileText className="h-3.5 w-3.5 text-amber-200/90" aria-hidden />
            Find jobs
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-2xl rounded-2xl border border-white/12 bg-[#12151c] p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.65)] sm:p-5"
        >
          <label htmlFor="agent-message" className="sr-only">
            Message
          </label>
          <textarea
            id="agent-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Describe your task or question, or attach a resume…"
            className="min-h-[7.5rem] w-full resize-y rounded-xl border-0 bg-transparent text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 outline-none focus:ring-0"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#1a1f2a] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-200 transition hover:border-white/35 hover:bg-white/5"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Attach a resume
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              className="sr-only"
              onChange={() => {
                toast.success(
                  "File noted — connect it to the editor import flow soon."
                );
              }}
            />
            <button
              type="submit"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3b5bfe] text-white shadow-lg shadow-blue-900/30 transition hover:bg-[#2f4ae6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b5bfe]"
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
