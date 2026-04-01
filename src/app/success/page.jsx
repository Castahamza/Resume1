import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Payment successful",
  description:
    "Your ResumeAI payment was processed. Return to the app to use your upgraded plan.",
};

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/60 via-white to-slate-50">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Payment successful
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Thank you—your subscription or purchase is being applied to your
            account. You can continue to the app to use your upgraded features.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Go to dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
