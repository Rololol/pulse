import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.EDITOR_API_SECRET;
  if (!secret) return NextResponse.json({ error: "Editorial API is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    where: { status: { in: ["DRAFT", "IN_REVIEW", "PUBLISHED"] } },
    orderBy: [{ status: "asc" }, { sourcePublishedAt: "desc" }, { createdAt: "desc" }],
    take: 150,
    include: { sources: { include: { source: { select: { name: true, url: true } } } } },
  });

  return NextResponse.json({ articles });
}