import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const schema = z.object({
  title: z.string().trim().min(8).max(180).optional(),
  standfirst: z.string().trim().min(20).max(300).optional(),
  body: z.string().trim().min(100).max(30000).optional(),
  category: z.enum(["Politik", "Deutschland", "Welt", "Wirtschaft", "Wissenschaft", "Digital", "Gesellschaft", "Kultur", "Sport"]).optional(),
  author: z.string().trim().max(100).optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
});
type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const secret = process.env.EDITOR_API_SECRET;
  if (!secret) return NextResponse.json({ error: "Editorial API is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || Object.keys(parsed.data).length === 0) return NextResponse.json({ error: "Ungültige Bearbeitung." }, { status: 400 });
  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id }, include: { sources: { select: { sourceId: true } } } });
  if (!existing) return NextResponse.json({ error: "Artikel nicht gefunden." }, { status: 404 });
  if (parsed.data.status === "PUBLISHED") {
    if (!existing.sources.length) return NextResponse.json({ error: "Vor Veröffentlichung muss mindestens eine Quelle hinterlegt sein." }, { status: 409 });
    const text = parsed.data.body ?? existing.body;
    if (text.length < 100 || text.includes("redaktionelle Bearbeitung erforderlich")) return NextResponse.json({ error: "Bitte einen redaktionell geprüften Volltext ergänzen." }, { status: 409 });
  }
  const article = await prisma.article.update({ where: { id }, data: { ...parsed.data, ...(parsed.data.status === "PUBLISHED" && !existing.publishedAt ? { publishedAt: new Date() } : {}), ...(parsed.data.status && parsed.data.status !== "PUBLISHED" ? { publishedAt: null } : {}) }, select: { id: true, slug: true, title: true, status: true, publishedAt: true, updatedAt: true } });
  return NextResponse.json({ article });
}