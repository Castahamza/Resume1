"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 py-16">
      <div className="max-w-md rounded-2xl border border-amber-200 bg-white px-6 py-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">
          Dashboard unavailable
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          We couldn&apos;t load this section. Your data is safe—try again in a
          moment.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            My resumes
          </Link>
        </div>
      </div>
    </div>
  );
}
