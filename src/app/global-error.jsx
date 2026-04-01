"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Catches errors in the root layout. Must define <html> and <body>.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 antialiased">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white px-6 py-8 text-center shadow-lg">
          <h1 className="text-lg font-bold text-slate-900">
            Application error
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            A critical error occurred. Please refresh the page or try again
            shortly.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
