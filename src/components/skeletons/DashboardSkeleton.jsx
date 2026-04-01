import { Loader2 } from "lucide-react";

function Shimmer({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
        <div className="h-16 border-b border-slate-200 px-4 py-4">
          <Shimmer className="h-9 w-36" />
        </div>
        <div className="space-y-2 p-3">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-10 w-full" />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
          <Shimmer className="h-9 w-9 rounded" />
          <Shimmer className="h-5 w-28" />
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div className="space-y-3">
                <Shimmer className="h-9 w-64 max-w-full" />
                <Shimmer className="h-5 w-48" />
              </div>
              <Shimmer className="h-11 w-44 shrink-0 rounded-lg" />
            </div>
            <div>
              <Shimmer className="mb-4 h-6 w-40" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <Shimmer className="h-6 w-full max-w-[200px]" />
                    <Shimmer className="mt-4 h-32 w-full rounded-xl" />
                    <Shimmer className="mt-3 h-4 w-1/2" />
                    <Shimmer className="mt-3 h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function ResumeListSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="h-6 w-full max-w-[200px] animate-pulse rounded bg-slate-200" />
          <div className="mt-4 aspect-[3/4] w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

/** Full-screen minimal spinner */
export function FullPageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
      <Loader2 className="h-9 w-9 animate-spin text-blue-600" aria-hidden />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
