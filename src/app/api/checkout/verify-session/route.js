import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabaseAdmin";
import { syncProfileFromCheckoutSession } from "@/lib/syncStripeCheckoutSession";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * After Checkout redirect, sync plan to Supabase when webhooks are missing
 * (local dev, misconfigured STRIPE_WEBHOOK_SECRET, etc.).
 */
export async function POST(request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Payments are not configured." },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : "";
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid session_id." }, { status: 400 });
    }

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (session.status !== "complete") {
      return NextResponse.json(
        { error: "Checkout session is not complete yet." },
        { status: 409 }
      );
    }

    const paidOk =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";
    if (!paidOk) {
      return NextResponse.json(
        { error: "Payment not completed for this session." },
        { status: 409 }
      );
    }

    const metaUser =
      session.metadata?.supabase_user_id || session.client_reference_id;
    if (!metaUser || metaUser !== user.id) {
      return NextResponse.json(
        { error: "This payment does not belong to your account." },
        { status: 403 }
      );
    }

    let admin;
    try {
      admin = createServiceRoleClient();
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { error: "Database not configured (service role)." },
        { status: 503 }
      );
    }

    const result = await syncProfileFromCheckoutSession(admin, session);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Could not update plan." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, plan: result.plan });
  } catch (err) {
    console.error("verify-session:", err);
    return NextResponse.json(
      { error: "Could not verify checkout session." },
      { status: 500 }
    );
  }
}
