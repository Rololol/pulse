import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findFirst({ where: { slug, status: "PUBLISHED" } });
  return article ? { title: article.title, description: article.standfirst } : { title: "Beitrag nicht gefunden" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { sources: { include: { source: true } } },
  });
  if (!article) notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#f5f4f0", color: "#17212b" }}>
      <header style={{ borderBottom: "1px solid #e5e4df", padding: "22px max(20px,calc((100vw - 900px)/2))" }}>
        <Link href="/" style={{ fontFamily: "Georgia,serif", fontSize: 27, fontWeight: 700 }}>pulse.</Link>
      </header>
      <article style={{ maxWidth: 820, margin: "0 auto", padding: "52px 22px 90px" }}>
        <Link href="/" style={{ color: "#d84a3a", fontSize: 12, fontWeight: 700 }}>← Zurück zur Übersicht</Link>
        <p style={{ marginTop: 32, color: "#d84a3a", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>{article.category}</p>
        <h1 style={{ margin: "12px 0 18px", fontFamily: "Georgia,serif", fontSize: "clamp(36px,7vw,60px)", lineHeight: 1.04, letterSpacing: "-1.5px" }}>{article.title}</h1>
        <p style={{ color: "#68737c", fontSize: 19, lineHeight: 1.55 }}>{article.standfirst}</p>
        <p style={{ marginTop: 25, color: "#8a939a", fontSize: 11 }}>{article.author || "Pulse Redaktion"} · {article.publishedAt?.toLocaleDateString("de-DE") || "Datum nicht verfügbar"}</p>
        {article.imageUrl && <img src={article.imageUrl} alt="" style={{ width: "100%", maxHeight: 430, objectFit: "cover", borderRadius: 6, margin: "24px 0" }} />}
        <div style={{ whiteSpace: "pre-wrap", fontSize: 17, lineHeight: 1.85 }}>{article.body}</div>
        <section style={{ marginTop: 48, padding: 22, background: "#fff", border: "1px solid #e5e4df", borderRadius: 6 }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 22 }}>Quellen und Nachweise</h2>
          {article.sources.length ? article.sources.map((item) => (
            <p key={item.sourceId} style={{ fontSize: 13 }}>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "#b84033", textDecoration: "underline" }}>{item.title || item.source.name} – Originalquelle öffnen</a>
            </p>
          )) : <p style={{ color: "#68737c", fontSize: 13 }}>Für diesen Beitrag sind derzeit keine externen Quellen hinterlegt.</p>}
        </section>
      </article>
    </main>
  );
}