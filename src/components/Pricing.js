"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const plans = [
  {
    kind: "light",
    topLabel: "No card required",
    topDescription:
      "Get a feel for how it works. No payment required.",
    planTitle: "Free",
    checkoutPlan: null,
    ctaHref: "/signup",
  },
  {
    kind: "featured",
    topLabel: "$29 monthly",
    topDescription:
      "Full ResumeAI access: unlimited resumes, premium templates, and AI-assisted edits.",
    planTitle: "Pro",
    checkoutPlan: "pro_monthly",
  },
  {
    kind: "light",
    topLabel: "$149 one-time",
    topDescription:
      "Everything in Pro with a single payment—no recurring fees.",
    planTitle: "Lifetime",
    checkoutPlan: "lifetime",
    guarantee: true,
  },
];

function PlanCta({ plan, onDark }) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    if (!plan.checkoutPlan) return;

    setLoading(true);
    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const next = encodeURIComponent("/#pricing");
        window.location.href = `/login?next=${next}`;
        return;
      }

      const res = await fetch(
        `${window.location.origin}/api/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan: plan.checkoutPlan }),
        }
      );

      const raw = await res.text();
      let data = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          window.alert(
            `Checkout HTTP ${res.status}. Server did not return JSON. First part of response:\n${raw.slice(0, 280)}`
          );
          return;
        }
      }

      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : `Checkout failed (HTTP ${res.status}).`;
        window.alert(msg);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      window.alert("Checkout started but no redirect URL returned.");
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "Could not start checkout. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const baseBtn =
    "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";

  if (plan.checkoutPlan) {
    return (
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={
          onDark
            ? `${baseBtn} bg-sky-500 text-white hover:bg-sky-400 focus-visible:outline-white`
            : `${baseBtn} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800`
        }
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        Get started
      </button>
    );
  }

  return (
    <Link
      href={plan.ctaHref}
      className={`${baseBtn} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800`}
    >
      Get started
    </Link>
  );
}

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="border-b border-slate-200/70 bg-white py-16 md:py-24 dark:border-slate-800 dark:bg-slate-950"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Fair pricing
          </p>
          <h2
            id="pricing-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-[2.25rem] md:leading-tight dark:text-white"
          >
            Choose the plan that fits your job search
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Upgrade anytime—secure checkout with Stripe. Cancel Pro whenever
            you need; Lifetime is yours to keep.
          </p>
        </header>

        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-5 lg:items-stretch">
          {plans.map((plan) =>
            plan.kind === "featured" ? (
              <div
                key={plan.planTitle}
                className="flex flex-col rounded-2xl bg-gradient-to-b from-blue-900 via-indigo-900 to-violet-950 p-8 shadow-lg shadow-indigo-900/25 ring-1 ring-white/10 lg:order-none lg:scale-[1.02] lg:z-10"
              >
                <p className="text-base font-bold capitalize text-white">
                  {plan.topLabel}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  {plan.topDescription}
                </p>
                <hr className="mt-6 border-white/25" />
                <p className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {plan.planTitle}
                </p>
                <PlanCta plan={plan} onDark />
                <p className="mt-5 flex items-center gap-2 text-xs font-medium text-white/90">
                  <Check
                    className="h-4 w-4 shrink-0 text-emerald-400"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  100% money-back guarantee
                </p>
              </div>
            ) : (
              <div
                key={plan.planTitle}
                className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-8 shadow-md shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
              >
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {plan.topLabel}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {plan.topDescription}
                </p>
                <hr className="mt-6 border-slate-200 dark:border-slate-700" />
                <p className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                  {plan.planTitle}
                </p>
                <PlanCta plan={plan} onDark={false} />
                {plan.guarantee ? (
                  <p className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <Check
                      className="h-4 w-4 shrink-0 text-emerald-600"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    100% money-back guarantee
                  </p>
                ) : null}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
