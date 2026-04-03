"use client";

/**
 * Post-login “which document?” modal (session: dismiss persists until logout).
 */
export function DashboardDocPickerOverlay({
  open,
  firstName,
  onClose,
  onResume,
  onCoverLetter,
  onResignation,
}) {
  if (!open) return null;

  const greet = firstName?.trim() ? `, ${firstName.trim()}` : "";

  const btnClass =
    "flex w-full items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d] px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:border-sky-500/50 hover:bg-[#2d333b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-picker-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#30363d] bg-[#161b22] p-8 shadow-2xl">
        <h2
          id="doc-picker-title"
          className="text-center text-lg font-semibold leading-snug text-white sm:text-xl"
        >
          Hello{greet}, which document do you want to create today?
        </h2>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={onResume} className={btnClass}>
            Resume
          </button>
          <button
            type="button"
            onClick={onCoverLetter}
            className={`relative ${btnClass}`}
          >
            Cover Letter
            <sup className="ml-1 text-[0.65rem] font-bold uppercase text-sky-400">
              Pro
            </sup>
          </button>
          <button type="button" onClick={onResignation} className={btnClass}>
            Resignation Letter
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full text-center text-sm text-slate-400 transition hover:text-white"
        >
          Close and go to dashboard.
        </button>
      </div>
    </div>
  );
}
