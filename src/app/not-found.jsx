import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "The page you requested could not be found on Zoru.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-slate-50 px-4 py-16 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-slate-600">
          That URL doesn&apos;t exist or may have moved. Start from the home
          page or your dashboard.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
