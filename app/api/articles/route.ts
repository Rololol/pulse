import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 60,
    select: {
      id: true, slug: true, title: true, standfirst: true, category: true,
      imageUrl: true, author: true, publishedAt: true, readingMinutes: true,
    },
  });

  return NextResponse.json(articles, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}