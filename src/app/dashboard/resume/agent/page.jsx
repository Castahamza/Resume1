"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { ResumeAgentWorkspace } from "@/components/ResumeAgentWorkspace";
import { isPaidPlan, FREE_MONTHLY_AI_LIMIT, FREE_MAX_RESUMES } from "@/lib/checkPlan";

export default function ResumeAgentPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("free");
  const [resumeCount, setResumeCount] = useState(0);

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        router.replace("/login?next=/dashboard/resume/agent");
        return;
      }
      setUser(session.user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .maybeSingle();
      const p = profile?.plan ?? "free";
      if (mounted) setPlan(p);

      const { count } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      if (mounted) setResumeCount(typeof count === "number" ? count : 0);
      if (mounted) setAuthLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        router.replace("/login?next=/dashboard/resume/agent");
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

  return (
    <DashboardShell
      user={user}
      plan={plan}
      headerTitle="AI Resume Agent"
      onLogout={handleLogout}
      usageSummary={{
        resumeCount,
        resumeLimit: isPaidPlan(plan) ? null : FREE_MAX_RESUMES,
        aiUsed: 0,
        aiLimit: isPaidPlan(plan) ? 0 : FREE_MONTHLY_AI_LIMIT,
      }}
      showUpgradeButton={!isPaidPlan(plan)}
      onUpgradeClick={() => {
        window.location.href = "/#pricing";
      }}
    >
      <ResumeAgentWorkspace />
    </DashboardShell>
  );
}
