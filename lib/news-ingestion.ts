import Parser from "rss-parser";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

type FeedConfig = { name: string; homepage: string; feedUrl: string };

const parser = new Parser({
  timeout: 12000,
  headers: { "User-Agent": process.env.NEWS_USER_AGENT || "PulseNewsBot/1.0" },
});

function configuredFeeds(): FeedConfig[] {
  return (process.env.NEWS_FEEDS || "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, homepage, feedUrl] = entry.split("|").map((part) => part.trim());
      if (!name || !homepage || !feedUrl) throw new Error("NEWS_FEEDS format: Name|Homepage-URL|Feed-URL;...");
      return { name, homepage, feedUrl };
    });
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "meldung";
}

export async function ingestConfiguredFeeds() {
  const feeds = configuredFeeds();
  if (!feeds.length) return { feeds: 0, imported: 0, skipped: 0, errors: ["No NEWS_FEEDS configured"] };

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const feed of feeds) {
    try {
      const source = await prisma.source.upsert({
        where: { url: feed.homepage },
        update: { name: feed.name, feedUrl: feed.feedUrl, isActive: true },
        create: { name: feed.name, url: feed.homepage, feedUrl: feed.feedUrl },
      });
      const parsed = await parser.parseURL(feed.feedUrl);

      for (const item of parsed.items.slice(0, 40)) {
        const link = item.link?.trim();
        const title = item.title?.trim();
        if (!link || !title) { skipped++; continue; }

        const fingerprint = createHash("sha256").update(link).digest("hex").slice(0, 12);
        const slug = `${slugify(title)}-${fingerprint}`;
        const exists = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
        if (exists) {
          await prisma.articleSource.upsert({
            where: { articleId_sourceId: { articleId: exists.id, sourceId: source.id } },
            update: { sourceUrl: link, title },
            create: { articleId: exists.id, sourceId: source.id, sourceUrl: link, title },
          });
          skipped++;
          continue;
        }

        const rawText = item.contentSnippet || item.summary || "";
        const cleanText = rawText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200);
        const published = item.isoDate ? new Date(item.isoDate) : new Date();
        const imageUrl = item.enclosure?.url || null;

        const article = await prisma.article.create({
          data: {
            slug,
            title,
            standfirst: (cleanText || "Importierter Beitrag – redaktionelle Einordnung ausstehend.").slice(0, 260),
            body: cleanText || "Dieser Beitrag wurde aus einem RSS-Feed übernommen. Vor einer Veröffentlichung ist eine eigene redaktionelle Bearbeitung erforderlich.",
            category: "Aktuell",
            status: "DRAFT",
            imageUrl,
            sourcePublishedAt: Number.isNaN(published.getTime()) ? new Date() : published,
            sources: { create: { sourceId: source.id, sourceUrl: link, title } },
          },
        });
        if (article.id) imported++;
      }
    } catch (error) {
      errors.push(`${feed.name}: ${error instanceof Error ? error.message : "Unknown ingestion error"}`);
    }
  }

  return { feeds: feeds.length, imported, skipped, errors };
}