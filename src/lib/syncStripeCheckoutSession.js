/**
 * Apply Stripe Checkout session to profiles (same logic as webhook).
 * @param {import("@supabase/supabase-js").SupabaseClient} admin — service role client
 * @param {import("stripe").Stripe.Checkout.Session} session
 * @returns {Promise<{ ok: true; plan: string } | { ok: false; error: string }>}
 */
export async function syncProfileFromCheckoutSession(admin, session) {
  const userId =
    session.metadata?.supabase_user_id || session.client_reference_id;

  if (!userId) {
    return { ok: false, error: "missing_user" };
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;

  const email =
    session.customer_email ||
    session.customer_details?.email ||
    null;

  if (session.mode === "subscription") {
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id || null;

    const { error } = await admin.from("profiles").upsert(
      {
        id: userId,
        email,
        plan: "pro",
        stripe_customer_id: customerId,
        stripe_subscription_id: subId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("profiles upsert (pro):", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, plan: "pro" };
  }

  if (session.mode === "payment") {
    const { error } = await admin.from("profiles").upsert(
      {
        id: userId,
        email,
        plan: "lifetime",
        stripe_customer_id: customerId,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("profiles upsert (lifetime):", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, plan: "lifetime" };
  }

  return { ok: false, error: "unknown_mode" };
}
