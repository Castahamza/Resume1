"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route segment error boundary (does not catch errors in root layout).
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="max-w-md rounded-2xl border border-red-200 bg-red-50/80 px-6 py-8 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          An unexpected error occurred. You can try again or return to the home
          page.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
