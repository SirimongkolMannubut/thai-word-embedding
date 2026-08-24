import { calculateLyricsMatchScore, ngramSimilarity } from "./lib/fuzzy";
import { searchSongsMaster } from "./lib/songs";

async function run() {
  console.log("Fuzzy score:", calculateLyricsMatchScore("หอหมกเอาไปฝากป้า", "ทรงอย่างแบด แซดอย่างบ่อย ปล่อยเธอไปกับเขาก็ดีแล้ว"));
  console.log("N-gram score:", ngramSimilarity("หอหมกเอาไปฝากป้า", "ทรงอย่างแบด แซดอย่างบ่อย ปล่อยเธอไปกับเขาก็ดีแล้ว", 2));

  const results = await searchSongsMaster("หอหมกเอาไปฝากป้า");
  console.log("Search results:");
  results.forEach(r => console.log(r.title, r.score));
}
run();
