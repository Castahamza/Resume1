import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabaseAdmin";
import { syncProfileFromCheckoutSession } from "@/lib/syncStripeCheckoutSession";

export const dynamic = "force-dynamic";

async function handleCheckoutSessionCompleted(admin, session) {
  const result = await syncProfileFromCheckoutSession(admin, session);
  if (!result.ok) {
    if (result.error === "missing_user") {
      console.warn("checkout.session.completed: missing supabase user id");
    } else {
      console.error("checkout.session.completed sync failed:", result.error);
    }
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
