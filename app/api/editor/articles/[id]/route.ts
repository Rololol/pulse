import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  status: z.enum(["IN_REVIEW", "PUBLISHED", "ARCHIVED"]),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const secret = process.env.EDITOR_API_SECRET;
  if (!secret) return NextResponse.json({ error: "Editorial API is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid article status" }, { status: 400 });

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { sources: { select: { sourceId: true } } },
  });
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  if (body.data.status === "PUBLISHED" && article.sources.length === 0) {
    return NextResponse.json({ error: "At least one source must be attached before publication." }, { status: 409 });
  }

  const updated = await prisma.article.update({
    where: { id },
    data: {
      status: body.data.status,
      ...(body.data.status === "PUBLISHED" && !article.publishedAt ? { publishedAt: new Date() } : {}),
    },
    select: { id: true, slug: true, title: true, status: true, publishedAt: true, updatedAt: true },
  });

  return NextResponse.json({ article: updated });
}