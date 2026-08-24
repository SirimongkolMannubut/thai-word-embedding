// app/api/search/route.ts
import { NextResponse } from "next/server";
import { findSimilarWords } from "@/lib/embedding";
import { searchSongsMaster } from "@/lib/songs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "อยากมีเวลาไปหาเมียน้อย";
  const mode = searchParams.get("mode") || "all";

  const similarWords = findSimilarWords(query, 10);
  const matchedSongs = await searchSongsMaster(query, 6);

  return NextResponse.json({
    query,
    mode,
    similarWords,
    matchedSongs,
    timestamp: new Date().toISOString()
  });
}
