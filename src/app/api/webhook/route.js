import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function handleCheckoutSessionCompleted(admin, session) {
  const userId =
    session.metadata?.supabase_user_id || session.client_reference_id;

  if (!userId) {
    console.warn("checkout.session.completed: missing supabase user id");
    return;
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

    if (error) console.error("profiles upsert (pro):", error);
  } else if (session.mode === "payment") {
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

    if (error) console.error("profiles upsert (lifetime):", error);
  }
}

async function handleSubscriptionDeleted(admin, subscription) {
  const subId = subscription.id;
  const { error } = await admin
    .from("profiles")
    .update({
      plan: "free",
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subId);

  if (error) console.error("profiles downgrade on cancel:", error);
}

async function handleSubscriptionUpdated(admin, subscription) {
  const subId = subscription.id;
  const userId = subscription.metadata?.supabase_user_id;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer;

  if (subscription.status === "active" || subscription.status === "trialing") {
    if (!userId) return;
    const { error } = await admin.from("profiles").upsert(
      {
        id: userId,
        plan: "pro",
        stripe_customer_id: customerId,
        stripe_subscription_id: subId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) console.error("profiles upsert (sub updated):", error);
    return;
  }

  if (
    subscription.status === "canceled" ||
    subscription.status === "unpaid" ||
    subscription.status === "incomplete_expired" ||
    subscription.status === "paused"
  ) {
    await handleSubscriptionDeleted(admin, subscription);
  }
}

export async function POST(request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !whSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(admin, event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(admin, event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(admin, event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
