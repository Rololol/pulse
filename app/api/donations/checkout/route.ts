import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  amount: z.number().int().min(2).max(250),
  cadence: z.enum(["once", "monthly"]),
  email: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Spendenzahlungen sind noch nicht aktiviert." }, { status: 503 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Spendenauswahl." }, { status: 400 });

  const { amount, cadence, email } = parsed.data;
  const stripe = new Stripe(key);
  const donation = await prisma.donation.create({
    data: { amountCents: amount * 100, isRecurring: cadence === "monthly", supporterEmail: email },
  });

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: cadence === "monthly" ? "subscription" : "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amount * 100,
          product_data: { name: "Freiwillige Unterstützung für Pulse" },
          ...(cadence === "monthly" ? { recurring: { interval: "month" as const } } : {}),
        },
      }],
      ...(email ? { customer_email: email } : {}),
      success_url: `${siteUrl}/unterstuetzung/danke?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?support=cancelled`,
      metadata: { donationId: donation.id },
    });
    await prisma.donation.update({ where: { id: donation.id }, data: { providerPaymentId: session.id } });
    return NextResponse.json({ url: session.url });
  } catch {
    await prisma.donation.update({ where: { id: donation.id }, data: { status: "failed" } });
    return NextResponse.json({ error: "Checkout konnte nicht gestartet werden." }, { status: 502 });
  }
}