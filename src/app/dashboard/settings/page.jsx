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
      showUpgradeButton={!isPaidPlan(plan)}
      onUpgradeClick={() => {
        window.location.href = "/#pricing";
      }}
    >
      <main className="flex-1 px-4 py-8 text-slate-200 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Your profile and subscription at a glance.
          </p>
        </div>

        <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Profile
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-400">Name</dt>
              <dd className="mt-1 text-white">{displayName}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-400">Email</dt>
              <dd className="mt-1 font-mono text-white">{user.email}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Plan
          </h2>
          <p className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-lg font-bold text-white">
              {planBadgeLabel(plan)}
            </span>
            {!isPaidPlan(plan) ? (
              <span className="text-sm text-slate-400">
                — 1 resume, {FREE_MONTHLY_AI_LIMIT} AI uses/mo, Modern template
                only
              </span>
            ) : (
              <span className="text-sm text-slate-400">
                — Unlimited resumes, AI, and all templates
              </span>
            )}
          </p>
          {!isPaidPlan(plan) ? (
            <Link
              href="/#pricing"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-400"
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
