import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

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

    const priceId =
      plan === "pro_monthly"
        ? process.env.STRIPE_PRICE_PRO_MONTHLY
        : process.env.STRIPE_PRICE_LIFETIME;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe Price IDs are not configured on the server." },
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
    return NextResponse.json(
      { error: "Could not start checkout. Try again later." },
      { status: 500 }
    );
  }
}
