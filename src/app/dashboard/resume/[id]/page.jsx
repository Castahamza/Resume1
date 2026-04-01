"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { ResumeEditor } from "@/components/ResumeEditor";

export default function EditResumePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : null;

  const [status, setStatus] = useState("loading");
  const [row, setRow] = useState(null);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    async function load() {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("resumes")
        .select("id, title, content, template, updated_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setStatus("error");
        return;
      }

      setRow(data);
      setStatus("ready");
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (!id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="text-center text-slate-600">Invalid resume link.</p>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <Loader2 className="h-9 w-9 animate-spin text-blue-600" aria-hidden />
        <p className="text-sm font-medium">Loading resume…</p>
      </div>
    );
  }

  if (status === "error" || !row) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <p className="max-w-md text-center text-slate-600">
          We couldn&apos;t load this resume. It may have been deleted or you
          don&apos;t have access.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <ResumeEditor
      resumeId={row.id}
      initialTitle={row.title}
      initialTemplate={row.template ?? "default"}
      initialContent={row.content}
      pageHeading="Edit resume"
    />
  );
}
