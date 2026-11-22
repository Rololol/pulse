import Link from "next/link";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function DonationThanks({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  let confirmed = false;
  const key = process.env.STRIPE_SECRET_KEY;
  if (key && sessionId) {
    try {
      const stripe = new Stripe(key);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      confirmed = session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
    } catch {
      confirmed = false;
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f5f4f0", color: "#17212b" }}>
      <section style={{ width: "min(100%,520px)", padding: 34, borderRadius: 9, background: "#fff", border: "1px solid #e5e4df" }}>
        <Link href="/" style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700 }}>pulse.</Link>
        <h1 style={{ margin: "30px 0 12px", fontFamily: "Georgia,serif", fontSize: 36, lineHeight: 1.1 }}>{confirmed ? "Danke, dass du Pulse unterstützt." : "Deine Unterstützung wird geprüft."}</h1>
        <p style={{ color: "#68737c", fontSize: 14, lineHeight: 1.7 }}>{confirmed ? "Die Zahlung wurde von Stripe als abgeschlossen bestätigt. Deine Unterstützung hilft, unabhängige Berichterstattung zugänglich zu halten." : "Wir konnten den Zahlungsstatus noch nicht bestätigen. Falls du gerade bezahlt hast, prüfe bitte auch die Bestätigung von Stripe."}</p>
        <Link href="/" style={{ display: "inline-block", marginTop: 18, padding: "12px 17px", borderRadius: 4, background: "#142332", color: "#fff", fontSize: 12, fontWeight: 700 }}>Zur Startseite</Link>
      </section>
    </main>
  );
}