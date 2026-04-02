import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
/** Stripe Node SDK is not supported on Edge — force Node on Vercel. */
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!secret || !publishable) {
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
      return NextResponse.json(
        { error: "Sign in to continue to checkout." },
        { status: 401 }
      );
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
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const plan = body.plan;
    if (plan !== "pro_monthly" && plan !== "lifetime") {
      return NextResponse.json(
        { error: "Invalid plan. Use pro_monthly or lifetime." },
        { status: 400 }
      );
    }

    const rawPriceId =
      plan === "pro_monthly"
        ? process.env.STRIPE_PRICE_PRO_MONTHLY
        : process.env.STRIPE_PRICE_LIFETIME;
    const priceId = rawPriceId?.trim() || null;

    if (!priceId) {
      const keyName =
        plan === "pro_monthly"
          ? "STRIPE_PRICE_PRO_MONTHLY"
          : "STRIPE_PRICE_LIFETIME";
      return NextResponse.json(
        {
          error: `Add ${keyName} in Vercel → Environment Variables (value = Stripe Price ID starting with price_), enable Production + Preview, then Redeploy.`,
        },
        { status: 503 }
      );
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const stripe = new Stripe(secret);
    const mode = plan === "pro_monthly" ? "subscription" : "payment";

    const params = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        plan_type: plan,
      },
    };

    if (user.email) {
      params.customer_email = user.email;
    }

    if (mode === "subscription") {
      params.subscription_data = {
        metadata: {
          supabase_user_id: user.id,
          plan_type: plan,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(params);

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create checkout session URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout POST error:", err);
    // Avoid relying on `instanceof Stripe.errors.StripeError` — some bundlers
    // break that check on Vercel, which hid the real Stripe message.
    const msg =
      err &&
      typeof err === "object" &&
      typeof err.message === "string" &&
      err.message.trim() !== ""
        ? err.message.trim()
        : null;
    if (msg) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return NextResponse.json(
      {
        error:
          "Could not start checkout. Open Vercel → Logs and search for checkout POST error.",
      },
      { status: 500 }
    );
  }
}
