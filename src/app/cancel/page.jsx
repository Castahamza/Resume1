import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata = {
  title: "Checkout cancelled",
  description:
    "Your Stripe checkout was cancelled. No charge was made on Zoru.",
};

export default function CancelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-100/80 via-white to-slate-50">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <XCircle className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Checkout cancelled
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            No charges were made. You can return to pricing anytime to choose a
            plan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              View pricing
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
