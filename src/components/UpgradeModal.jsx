"use client";

import Link from "next/link";

/**
 * @param {{ open: boolean; onClose: () => void; title?: string; message?: string }} props
 */
export function UpgradeModal({
  open,
  onClose,
  title = "Upgrade to Pro",
  message = "This feature needs a Pro or Lifetime plan—or you’ve reached your free AI limit for this month.",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2
          id="upgrade-modal-title"
          className="text-lg font-bold text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Not now
          </button>
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            onClick={onClose}
          >
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}
