import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!key || !webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const stripe = new Stripe(key);
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const donationId = session.metadata?.donationId;
    if (donationId) {
      await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: "paid",
          supporterEmail: session.customer_details?.email || session.customer_email || undefined,
        },
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const donationId = session.metadata?.donationId;
    if (donationId) await prisma.donation.update({ where: { id: donationId }, data: { status: "expired" } });
  }

  return NextResponse.json({ received: true });
}