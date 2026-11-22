import Link from "next/link";

const principles = [
  ["Quellen sichtbar machen", "Wir verlinken nach Möglichkeit Originaldokumente, Datensätze, Studien und direkte Aussagen. Leser sollen nachvollziehen können, worauf eine Meldung beruht."],
  ["Fakten und Einordnung trennen", "Nachricht, Analyse, Kommentar und unbestätigte Angaben werden klar gekennzeichnet. Vermutungen werden nicht als gesicherte Tatsachen dargestellt."],
  ["Mehrere Perspektiven prüfen", "Bei strittigen Themen prüfen wir relevante Gegenpositionen und erklären, wo Belege fehlen oder Bewertungen auseinandergehen."],
  ["Fehler transparent korrigieren", "Wesentliche Korrekturen werden kenntlich gemacht. Veröffentlichte Beiträge sollen eine nachvollziehbare Aktualisierungshistorie erhalten."],
  ["KI verantwortungsvoll einsetzen", "Automatisierung kann Recherche unterstützen, ersetzt aber keine redaktionelle Prüfung. KI-generierte Inhalte werden nicht ungeprüft als Tatsachen veröffentlicht."],
  ["Unabhängigkeit offenlegen", "Finanzierungsquellen, Interessenkonflikte und mögliche Einschränkungen unserer Unabhängigkeit sollen transparent gemacht werden."],
];

export default function StandardsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f5f4f0", color: "#17212b" }}>
      <header style={{ borderBottom: "1px solid #e5e4df", padding: "22px max(20px,calc((100vw - 900px)/2))" }}><Link href="/" style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700 }}>pulse.</Link></header>
      <article style={{ maxWidth: 850, margin: "0 auto", padding: "55px 22px 90px" }}>
        <p style={{ color: "#d84a3a", fontSize: 11, fontWeight: 800, letterSpacing: ".13em" }}>UNSER REDAKTIONELLES SELBSTVERSTÄNDNIS</p>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(38px,7vw,62px)", lineHeight: 1.04, letterSpacing: "-1.5px" }}>Vertrauen entsteht durch Nachvollziehbarkeit.</h1>
        <p style={{ color: "#68737c", fontSize: 18, lineHeight: 1.65 }}>Diese Standards beschreiben den Anspruch, an dem Pulse seine Berichterstattung messen will. Sie sind ein Arbeitsrahmen und müssen mit dem Aufbau der Redaktion weiter konkretisiert werden.</p>
        {principles.map(([title, text], index) => <section key={title} style={{ padding: "22px 0", borderTop: "1px solid #deddd7" }}><span style={{ color: "#d84a3a", fontSize: 11, fontWeight: 800 }}>0{index + 1}</span><h2 style={{ fontFamily: "Georgia,serif", fontSize: 25, margin: "8px 0" }}>{title}</h2><p style={{ color: "#68737c", lineHeight: 1.75, fontSize: 14 }}>{text}</p></section>)}
        <Link href="/" style={{ color: "#b84033", fontSize: 13, fontWeight: 700 }}>← Zurück zu Pulse</Link>
      </article>
    </main>
  );
}