"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { getSupabase } from "@/lib/supabase";
import { DashboardShell } from "@/components/DashboardShell";
import {
  planBadgeLabel,
  isPaidPlan,
  FREE_MONTHLY_AI_LIMIT,
} from "@/lib/checkPlan";

export default function SettingsPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      setUser(session.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .maybeSingle();
      if (mounted) {
        setPlan(profile?.plan ?? "free");
        setAuthLoading(false);
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      setUser(session.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }

  const displayName =
    user.user_metadata?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Member";

  return (
    <DashboardShell
      user={user}
      plan={plan}
      headerTitle="Settings"
      onLogout={handleLogout}
    >
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your profile and subscription at a glance.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Profile
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-700">Name</dt>
              <dd className="mt-1 text-slate-900">{displayName}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Email</dt>
              <dd className="mt-1 font-mono text-slate-900">{user.email}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Plan
          </h2>
          <p className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-lg font-bold text-slate-900">
              {planBadgeLabel(plan)}
            </span>
            {!isPaidPlan(plan) ? (
              <span className="text-sm text-slate-600">
                — 1 resume, {FREE_MONTHLY_AI_LIMIT} AI uses/mo, Modern template
                only
              </span>
            ) : (
              <span className="text-sm text-slate-600">
                — Unlimited resumes, AI, and all templates
              </span>
            )}
          </p>
          {!isPaidPlan(plan) ? (
            <Link
              href="/#pricing"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Upgrade to Pro
            </Link>
          ) : null}
        </section>
      </div>
      </main>
    </DashboardShell>
  );
}
