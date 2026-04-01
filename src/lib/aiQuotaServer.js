import { createServiceRoleClient } from "@/lib/supabaseAdmin";
import { isPaidPlan, FREE_MONTHLY_AI_LIMIT } from "@/lib/checkPlan";

function utcMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {string} userId
 * @param {string | undefined} email
 */
export async function ensureProfileRow(admin, userId, email) {
  const { data: existing, error: selErr } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (selErr) {
    console.error("ensureProfileRow select:", selErr);
    return;
  }
  if (existing) return;

  const { error } = await admin.from("profiles").insert({
    id: userId,
    email: email ?? null,
    plan: "free",
  });
  if (error && error.code !== "23505") console.error("ensureProfileRow:", error);
}

async function loadAiUsage(admin, userId) {
  const { data, error } = await admin
    .from("profiles")
    .select("plan, ai_generations_month, ai_generations_count")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("loadAiUsage:", error);
    return { plan: "free", count: 0 };
  }

  const plan = data?.plan ?? "free";
  const m = utcMonthKey();
  const count =
    data?.ai_generations_month === m ? Number(data?.ai_generations_count ?? 0) : 0;

  return { plan, count };
}

/**
 * @param {import("@supabase/supabase-js").User} user
 * @returns {Promise<
 *   | { allowed: true; admin: import("@supabase/supabase-js").SupabaseClient; plan: string }
 *   | { allowed: false; status: number; body: Record<string, unknown> }
 * >}
 */
export async function resolveAiQuota(user) {
  let admin;
  try {
    admin = createServiceRoleClient();
  } catch (e) {
    console.error(e);
    return {
      allowed: false,
      status: 503,
      body: { error: "Usage tracking is not configured.", code: "CONFIG" },
    };
  }

  await ensureProfileRow(admin, user.id, user.email);
  const { plan, count } = await loadAiUsage(admin, user.id);

  if (isPaidPlan(plan)) {
    return { allowed: true, admin, plan };
  }

  if (count >= FREE_MONTHLY_AI_LIMIT) {
    return {
      allowed: false,
      status: 403,
      body: {
        error: `Free plan includes ${FREE_MONTHLY_AI_LIMIT} AI generations per month. Upgrade to Pro for unlimited AI.`,
        code: "AI_MONTHLY_LIMIT",
      },
    };
  }

  return { allowed: true, admin, plan };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {string} userId
 * @param {string} plan
 */
export async function incrementFreeAiUsage(admin, userId, plan) {
  if (isPaidPlan(plan)) return;

  const m = utcMonthKey();
  const { data: row } = await admin
    .from("profiles")
    .select("ai_generations_month, ai_generations_count")
    .eq("id", userId)
    .maybeSingle();

  const count =
    row?.ai_generations_month === m ? Number(row?.ai_generations_count ?? 0) : 0;

  const { error } = await admin
    .from("profiles")
    .update({
      ai_generations_month: m,
      ai_generations_count: count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) console.error("incrementFreeAiUsage:", error);
}
