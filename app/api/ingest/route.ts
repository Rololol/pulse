import { NextRequest, NextResponse } from "next/server";
import { ingestConfiguredFeeds } from "@/lib/news-ingestion";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const secret = process.env.NEWS_INGEST_SECRET;
  if (!secret) return NextResponse.json({ error: "Ingestion is not configured" }, { status: 503 });

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await ingestConfiguredFeeds();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}