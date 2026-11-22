import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "pulse-news",
    timestamp: new Date().toISOString(),
  });
}