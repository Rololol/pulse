"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bookmark, Clock3, Heart, Search, X } from "lucide-react";

type Story = {
  id: string | number;
  slug?: string;
  category: string;
  title: string;
  summary: string;
  time: string;
  read: string;
  image: string;
  author: string;
};

const image = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const demoStories: Story[] = [
  {
    id: 1, category: "Politik", title: "Wie Städte den Wandel gestalten – und wer ihn bezahlt",
    summary: "Kommunen stehen vor großen Entscheidungen. Ein Blick auf Finanzierung, Prioritäten und die Folgen für den Alltag.",
    time: "Vor 18 Min.", read: "6 Min.", author: "Pulse Redaktion",
    image: image("photo-1480714378408-67cf0d13bc1b"),
  },
  {
    id: 2, category: "Wirtschaft", title: "Die neue Industriepolitik: Zwischen Standortschutz und Wettbewerb",
    summary: "Unternehmen und Politik suchen nach Antworten auf globale Umbrüche. Die wichtigsten Interessen im Überblick.",
    time: "Vor 42 Min.", read: "8 Min.", author: "Wirtschaftsdesk",
    image: image("photo-1486406146926-c627a92ad1ab"),
  },
  {
    id: 3, category: "Wissenschaft", title: "Energieforschung: Was die nächste Generation möglich machen könnte",
    summary: "Forschungsteams arbeiten an effizienteren Speicherlösungen. Was bereits belegt ist – und was noch offen bleibt.",
    time: "Vor 1 Std.", read: "5 Min.", author: "Wissensdesk",
    image: image("photo-1473341304170-971dccb5ac1e"),
  },
  {
    id: 4, category: "Welt", title: "Diplomatie unter Druck: Die schwierige Suche nach gemeinsamen Linien",
    summary: "Internationale Verhandlungen zeigen, wie weit Interessen auseinanderliegen und wo dennoch Spielräume entstehen.",
    time: "Vor 2 Std.", read: "7 Min.", author: "Auslandskorrespondent",
    image: image("photo-1529109388462-2ec8b3d7b3f4"),
  },
  {
    id: 5, category: "Digital", title: "Künstliche Intelligenz im Alltag: Zwischen Nutzen und neuen Abhängigkeiten",
    summary: "Welche Aufgaben Systeme übernehmen können, wo Risiken liegen und welche Regeln jetzt diskutiert werden.",
    time: "Vor 3 Std.", read: "9 Min.", author: "Digitaldesk",
    image: image("photo-1677442136019-21780ecad995"),
  },
  {
    id: 6, category: "Gesellschaft", title: "Wohnen wird zur Zukunftsfrage: Neue Ideen für bezahlbaren Raum",
    summary: "Genossenschaften, Kommunen und private Anbieter testen unterschiedliche Modelle gegen knappen Wohnraum.",
    time: "Vor 4 Std.", read: "6 Min.", author: "Pulse Redaktion",
    image: image("photo-1449844908441-8829872d2607"),
  },
];

const categories = ["Alle", "Politik", "Welt", "Wirtschaft", "Wissenschaft", "Digital", "Gesellschaft"];
const navItems = ["Aktuell", "Deutschland", "Welt", "Wirtschaft", "Wissenschaft", "Digital", "Hintergründe", "Meinung"];

export default function Home() {
  const [stories, setStories] = useState<Story[]>(demoStories);
  const [category, setCategory] = useState("Alle");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Array<string | number>>([]);
  const [donationOpen, setDonationOpen] = useState(false);
  const [amount, setAmount] = useState(5);
  const [donationType, setDonationType] = useState<"once" | "monthly">("once");
  const [activeNav, setActiveNav] = useState("Aktuell");
  const [donationMessage, setDonationMessage] = useState("");
  const [donationLoading, setDonationLoading] = useState(false);

  const startDonation = async () => {
    setDonationLoading(true);
    setDonationMessage("");
    try {
      const response = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, cadence: donationType }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error || "Checkout konnte nicht gestartet werden.");
      window.location.assign(result.url);
    } catch (error) {
      setDonationMessage(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten.");
    } finally {
      setDonationLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/articles").then((response) => response.ok ? response.json() : []).then((articles) => {
      if (Array.isArray(articles) && articles.length) {
        setStories(articles.map((article) => ({
          id: article.id, slug: article.slug, category: article.category, title: article.title,
          summary: article.standfirst, time: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("de-DE") : "Aktuell",
          read: `${article.readingMinutes} Min.`, author: article.author || "Pulse Redaktion",
          image: article.imageUrl || image("photo-1486406146926-c627a92ad1ab"),
        })));
      }
    }).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => stories.filter((story) => {
    const matchesCategory = category === "Alle" || story.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${story.title} ${story.summary} ${story.category}`.toLowerCase().includes(q);
    const matchesSaved = activeNav !== "Merkliste" || saved.includes(story.id);
    return matchesCategory && matchesQuery && matchesSaved;
  }), [category, query, stories, activeNav, saved]);

  const toggleSaved = (id: string | number) => setSaved((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  );

  return (
    <main className="site-shell">
      <div className="topline">
        <span><strong>Pulse</strong> · Unabhängig. Einordnend. Offen.</span>
        <span>Eine neue Perspektive auf das, was wichtig ist</span>
      </div>

      <header className="masthead">
        <a className="brand" href="#" aria-label="Pulse Startseite">
          <span className="brand-mark">P</span>
          <span><span className="brand-name">pulse</span><span className="brand-tag">Nachrichten mit Zusammenhang</span></span>
        </a>
        <div className="header-actions">
          <button className="header-btn" onClick={() => document.getElementById("news-search")?.focus()}><Search size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />Suchen</button>
          <button className="header-btn" onClick={() => setActiveNav("Merkliste")}>Merkliste ({saved.length})</button>
          <button className="header-btn primary" onClick={() => setDonationOpen(true)}><Heart size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />Unterstützen</button>
        </div>
      </header>

      <div className="nav-wrap">
        <nav className="nav" aria-label="Hauptnavigation">
          {navItems.map((item) => <button key={item} className={activeNav === item ? "active" : ""} onClick={() => { setActiveNav(item); setCategory(item === "Aktuell" ? "Alle" : categories.includes(item) ? item : "Alle"); }}>{item}</button>)}
          <button className="live-link" onClick={() => setActiveNav("Live")}>● Live</button>
        </nav>
      </div>

      <div className="page">
        <div className="date-row">
          <span>SONNTAG, 22. NOVEMBER 2026 <span style={{ margin: "0 8px", color: "#c4c5c0" }}>/</span> DIE LAGE IM ÜBERBLICK</span>
          <span className="demo-label"><span className="demo-dot" /> Konzeptansicht · Beispieldaten, keine Live-Nachrichten</span>
        </div>

        <div className="breaking">
          <span className="breaking-tag">Pulse Fokus</span>
          <span className="breaking-text">Nicht nur was passiert zählt – sondern auch, was davor geschah und was daraus folgt.</span>
          <span className="breaking-time">UNSER ANSPRUCH</span>
        </div>

        <section className="lead-grid" aria-label="Aufmacher">
          <article className="lead-card">
            <div className="lead-image" style={{ backgroundImage: `url("${image("photo-1516321318423-f06f85e504b3", 1500)}")` }} />
            <div className="lead-content">
              <span className="eyebrow">Die große Einordnung · Titelgeschichte</span>
              <h1 className="lead-title">Die Welt verstehen. Nicht nur Schlagzeilen lesen.</h1>
              <p className="lead-summary">Pulse verbindet aktuelle Entwicklungen mit Hintergründen, überprüfbaren Quellen und unterschiedlichen Perspektiven. Damit aus Information Orientierung wird.</p>
              <div className="story-meta"><span>Das Pulse Versprechen</span><span className="separator">·</span><span>4 Min. Lesezeit</span></div>
              <a href="#aktuelle-themen" className="read-link">So arbeitet Pulse <ArrowUpRight size={14} /></a>
            </div>
          </article>

          <div className="side-stack">
            <article className="side-story">
              <div className="side-thumb" style={{ backgroundImage: `url("${image("photo-1520869562399-e772f042f422", 400)}")` }} />
              <div><div className="side-kicker">Analyse · Politik</div><h2 className="side-title">Was politische Entscheidungen konkret verändern</h2><div className="side-time">Einordnung · 7 Min.</div></div>
            </article>
            <article className="side-story">
              <div className="side-thumb" style={{ backgroundImage: `url("${image("photo-1460925895917-afdab827c52f", 400)}")` }} />
              <div><div className="side-kicker">Hintergrund · Wirtschaft</div><h2 className="side-title">Zahlen verstehen, statt ihnen nur zu folgen</h2><div className="side-time">Dossier · 5 Min.</div></div>
            </article>
            <article className="side-story">
              <div className="side-thumb" style={{ backgroundImage: `url("${image("photo-1451187580459-43490279c0fa", 400)}")` }} />
              <div><div className="side-kicker">Welt · Perspektiven</div><h2 className="side-title">Ein Ereignis, mehrere Blickwinkel</h2><div className="side-time">Quellenvergleich · 6 Min.</div></div>
            </article>
          </div>
        </section>

        <section id="aktuelle-themen">
          <div className="section-head">
            <div><h2 className="section-title">Was heute wichtig ist</h2><div className="section-sub">Nachrichten, Hintergründe und Perspektiven – kuratiert an einem Ort.</div></div>
            <span className="section-sub">DIE PULSE AUSWAHL</span>
          </div>

          <div className="content-grid">
            <div>
              <div className="feed-toolbar">
                <div className="filter-list">
                  {categories.map((item) => <button key={item} className={category === item ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}
                </div>
                <input id="news-search" className="search-box" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Themen durchsuchen …" aria-label="Themen durchsuchen" />
              </div>

              <div className="article-list">
                {filtered.length ? filtered.map((story) => (
                  <article className="article-row" key={story.id}>
                    <div className="article-thumb" style={{ backgroundImage: `url("${story.image}")` }} />
                    <div>
                      <div className="article-category">{story.category} <span style={{ color: "#b3b8b9" }}>·</span> Beispielbeitrag</div>
                      <h3 className="article-title">{story.slug ? <a href={`/artikel/${story.slug}`}>{story.title}</a> : story.title}</h3>
                      <p className="article-summary">{story.summary}</p>
                      <div className="article-foot"><span>{story.time}</span><span>·</span><span><Clock3 size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />{story.read} Lesezeit</span><span>·</span><span>{story.author}</span>
                        <button className={saved.includes(story.id) ? "bookmark saved" : "bookmark"} aria-label={saved.includes(story.id) ? "Aus Merkliste entfernen" : "Zur Merkliste hinzufügen"} onClick={() => toggleSaved(story.id)}><Bookmark size={15} fill={saved.includes(story.id) ? "currentColor" : "none"} /></button>
                      </div>
                    </div>
                  </article>
                )) : <div className="empty-state">Keine passenden Beiträge gefunden. Ändere den Suchbegriff oder die Kategorie.</div>}
              </div>
            </div>

            <aside className="sidebar">
              <section className="panel">
                <h3 className="panel-title">Im Gespräch</h3>
                {["Wie verändert sich Europas Rolle in der Welt?", "Was kostet die Energiewende wirklich?", "Welche Regeln braucht künstliche Intelligenz?"].map((item, index) => <div className="trend-item" key={item}><span className="trend-num">0{index + 1}</span><div className="trend-copy">{item}<span className="trend-category">THEMENÜBERBLICK</span></div></div>)}
              </section>

              <section className="panel support-panel">
                <span className="eyebrow">Von Menschen getragen</span>
                <h3 className="panel-title">Guter Journalismus sollte allen gehören.</h3>
                <p>Pulse soll frei zugänglich bleiben. Deine freiwillige Unterstützung hilft, Recherche, Quellenprüfung und unabhängige Berichterstattung zu finanzieren.</p>
                <div className="support-points"><span>Keine Paywall</span><span>Keine Pflichtmitgliedschaft</span></div>
                <button className="support-button" onClick={() => setDonationOpen(true)}>Pulse freiwillig unterstützen <ArrowUpRight size={13} style={{ verticalAlign: "middle", marginLeft: 5 }} /></button>
                <span className="support-note">Freiwillig. Transparent. Jederzeit deine Entscheidung.</span>
              </section>

              <section className="panel">
                <h3 className="panel-title">Der Tag in deinem Postfach</h3>
                <p style={{ color: "#737d85", fontSize: 11, lineHeight: 1.55 }}>Die wichtigsten Entwicklungen. Einmal täglich. Ohne Dauerbeschallung.</p>
                <form onSubmit={(event) => { event.preventDefault(); alert("Die Newsletter-Anmeldung wird nach Einrichtung des Maildienstes aktiviert."); }}>
                  <input className="newsletter-input" type="email" required placeholder="Deine E-Mail-Adresse" aria-label="E-Mail-Adresse" />
                  <button className="newsletter-button" type="submit">Newsletter vormerken</button>
                </form>
                <span style={{ display: "block", marginTop: 8, color: "#939ba1", fontSize: 9 }}>In dieser Vorschau noch nicht mit einem Versanddienst verbunden.</span>
              </section>
            </aside>
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div><div className="footer-brand">pulse.</div><p className="footer-copy">Nachrichten mit Zusammenhang. Unabhängiger Journalismus, nachvollziehbare Quellen und offene Zugänge – getragen von einer Gemeinschaft, die informiert bleiben will.</p></div>
          <div className="footer-links"><a href="/standards">Redaktionelle Standards</a><a href="/standards">Quellen & Transparenz</a><a href="/standards">Korrekturen</a><a href="mailto:redaktion@pulse.example">Kontakt</a></div>
        </div>
      </footer>

      {donationOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDonationOpen(false); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="donation-title">
          <div className="modal-head"><span className="demo-label"><Heart size={11} /> Leserfinanziert</span><button className="modal-close" onClick={() => setDonationOpen(false)} aria-label="Schließen"><X /></button></div>
          <h2 className="modal-title" id="donation-title">Unabhängigkeit ist nicht selbstverständlich.</h2>
          <p className="modal-copy">Mit deiner freiwilligen Unterstützung hilfst du, Recherche und Journalismus für alle zugänglich zu halten. Du entscheidest, ob und wie viel du gibst.</p>
          <div className="filter-list" style={{ marginTop: 18 }}>
            <button className={donationType === "once" ? "filter-chip selected" : "filter-chip"} onClick={() => setDonationType("once")}>Einmalig</button>
            <button className={donationType === "monthly" ? "filter-chip selected" : "filter-chip"} onClick={() => setDonationType("monthly")}>Monatlich</button>
          </div>
          <div className="amount-grid">{[2, 5, 10, 25].map((value) => <button key={value} className={amount === value ? "amount-option chosen" : "amount-option"} onClick={() => setAmount(value)}>{value} €</button>)}</div>
          <button className="modal-submit" disabled={donationLoading} onClick={startDonation}>{donationLoading ? "Checkout wird vorbereitet …" : `Mit ${amount} € ${donationType === "monthly" ? "monatlich" : "einmalig"} unterstützen`}</button>
          {donationMessage && <p role="alert" className="modal-disclaimer" style={{ color: "#b33b31" }}>{donationMessage}</p>}
          <p className="modal-disclaimer">Die Zahlung wird sicher über Stripe abgewickelt. Eine wiederkehrende Unterstützung kannst du jederzeit über Stripe kündigen.</p>
        </section>
      </div>}
    </main>
  );
}