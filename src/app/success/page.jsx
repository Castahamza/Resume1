"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [syncState, setSyncState] = useState(
    sessionId ? "syncing" : "idle"
  );
  const [syncDetail, setSyncDetail] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setSyncState("idle");
      return;
    }

    let cancelled = false;

    async function verify() {
      setSyncState("syncing");
      setSyncDetail(null);
      try {
        const supabase = getSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) setSyncState("auth");
          return;
        }

        const res = await fetch("/api/checkout/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.ok) {
          setSyncState("ok");
          setSyncDetail(data.plan ?? null);
        } else {
          setSyncState("error");
          setSyncDetail(
            typeof data.error === "string" ? data.error : "Sync failed."
          );
        }
      } catch {
        if (!cancelled) {
          setSyncState("error");
          setSyncDetail("Network error. Try refreshing or open the dashboard.");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900/40 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payment successful
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Thank you—your subscription or purchase is being applied to your
            account.
          </p>

          {sessionId ? (
            <div className="mt-4 flex min-h-[3rem] flex-col items-center justify-center gap-2 text-sm">
              {syncState === "syncing" ? (
                <p className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  Activating your plan…
                </p>
              ) : null}
              {syncState === "ok" ? (
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  {syncDetail
                    ? `Your account is now on ${syncDetail === "lifetime" ? "Lifetime" : "Pro"}.`
                    : "Your account is updated."}
                </p>
              ) : null}
              {syncState === "auth" ? (
                <p className="text-amber-800 dark:text-amber-200">
                  Sign in on this browser, then open the dashboard—your payment
                  is saved.
                </p>
              ) : null}
              {syncState === "error" ? (
                <p className="text-left text-amber-900 dark:text-amber-200">
                  {syncDetail}
                  <span className="mt-2 block text-slate-600 dark:text-slate-400">
                    Tip: set Stripe webhook to{" "}
                    <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
                      …/api/webhook
                    </code>{" "}
                    and add{" "}
                    <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
                      SUPABASE_SERVICE_ROLE_KEY
                    </code>{" "}
                    on Vercel.
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Go to dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
