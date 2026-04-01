"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FullPageLoader } from "@/components/skeletons/DashboardSkeleton";
import { getSupabase } from "@/lib/supabase";
import { ResumeEditor } from "@/components/ResumeEditor";
import { UpgradeModal } from "@/components/UpgradeModal";
import { isPaidPlan, FREE_MAX_RESUMES } from "@/lib/checkPlan";

export default function NewResumePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .maybeSingle();
      const plan = profile?.plan ?? "free";

      if (isPaidPlan(plan)) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { count, error } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (cancelled) return;
      if (!error && typeof count === "number" && count >= FREE_MAX_RESUMES) {
        setBlocked(true);
      }
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return <FullPageLoader label="Checking your plan…" />;
  }

  if (blocked) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <UpgradeModal
          open={upgradeOpen}
          onClose={() => {
            setUpgradeOpen(false);
            router.replace("/dashboard");
          }}
          title="Resume limit reached"
          message={`Free accounts can keep ${FREE_MAX_RESUMES} resume. Upgrade to Pro or Lifetime to create unlimited resumes and unlock all templates.`}
        />
        <div className="mx-auto max-w-md text-center">
          <p className="text-slate-700">
            You&apos;ve reached the free resume limit. Use the dialog above or
            go back to your dashboard.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <ResumeEditor pageHeading="New resume" />;
}
