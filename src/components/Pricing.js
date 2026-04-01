"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Get started and explore core tools at no cost.",
    features: [
      "1 resume template",
      "Basic AI suggestions",
      "PDF export (watermarked)",
      "Local draft history",
    ],
    cta: "Get started",
    checkoutPlan: null,
    ctaHref: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Full power for active job seekers.",
    features: [
      "Unlimited resumes & versions",
      "Advanced AI rewrites & tone",
      "All premium templates",
      "Cloud sync & backup",
      "Stripe subscription billing",
      "Priority support",
    ],
    cta: "Subscribe",
    checkoutPlan: "pro_monthly",
    highlighted: true,
  },
  {
    name: "Lifetime",
    price: "$149",
    period: " one-time",
    description: "Pay once, own Pro forever.",
    features: [
      "Everything in Pro",
      "Lifetime updates included",
      "No recurring fees",
      "Best for career-long use",
    ],
    cta: "Buy lifetime",
    checkoutPlan: "lifetime",
    highlighted: false,
  },
];

function PlanCta({ plan }) {
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

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: plan.checkoutPlan }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        window.alert(typeof data.error === "string" ? data.error : "Checkout failed.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      window.alert("Could not start checkout. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (plan.checkoutPlan) {
    return (
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={
          plan.highlighted
            ? "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
            : "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
        }
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        {plan.cta}
      </button>
    );
  }

  return (
    <Link
      href={plan.ctaHref}
      className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      {plan.cta}
    </Link>
  );
}

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="border-b border-slate-200/70 bg-gradient-to-b from-slate-50/80 to-white py-16 md:py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="pricing-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Choose a plan that fits your search. Upgrade or go lifetime when
            you&apos;re ready—secure checkout powered by Stripe.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlighted
                  ? "relative flex flex-col rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg shadow-blue-600/10 ring-1 ring-blue-600/20 lg:z-10 lg:scale-105"
                  : "flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
              }
            >
              {plan.highlighted ? (
                <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Popular
                </p>
              ) : null}
              <h3 className="text-lg font-semibold text-slate-900">
                {plan.name}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {plan.period}
                </span>
              </p>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <PlanCta plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
