import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!key || !sessionId) return NextResponse.json({ error: "Missing payment session" }, { status: 400 });

  try {
    const stripe = new Stripe(key);
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkout.mode !== "subscription" || checkout.status !== "complete" || !checkout.customer) {
      return NextResponse.json({ error: "No active recurring support found for this session" }, { status: 404 });
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const portal = await stripe.billingPortal.sessions.create({
      customer: typeof checkout.customer === "string" ? checkout.customer : checkout.customer.id,
      return_url: siteUrl,
    });
    return NextResponse.redirect(portal.url);
  } catch {
    return NextResponse.json({ error: "The Stripe customer portal is unavailable. Please contact the Pulse team." }, { status: 502 });
  }
}