const { calculateLyricsMatchScore } = require('./lib/fuzzy.ts'); // we can't easily require ts in plain node, let's just mock it for the test
async function searchOnlineThaiSongs(query, limit = 6) {
  try {
    let itunesQuery = query;
    let fallbackTitle = query;
    let fallbackArtist = "ศิลปินไทย";
    let isScraped = false;

    if (query.trim().length > 15 && query.includes(" ")) {
       const ddgQ = encodeURIComponent(query + " เนื้อเพลง");
       console.log("Searching DDG for:", ddgQ);
       const ddgRes = await fetch("https://html.duckduckgo.com/html/?q=" + ddgQ, {
         headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
       });
       if (ddgRes.ok) {
         const text = await ddgRes.text();
         const matches = text.match(/<a class="result__snippet[^>]*>(.*?)<\/a>/g);
         const snips = matches ? matches.map(s => s.replace(/<[^>]+>/g, '')) : [];
         let found = null;
         for (const snip of snips) {
           const m1 = snip.match(/เนื้อเพลง:?\s*([^\s][^ศ]*?)\s*ศิลปิน:?\s*([^\s][^อ]*?)(?:\s*อัลบั้ม|\s*$|\.\.\.)/);
           if (m1) { found = { t: m1[1].trim(), a: m1[2].trim() }; break; }
           
           const m2 = snip.match(/เนื้อเพลง\s+([^-]+)\s*-\s*([^-\n]+)/);
           if (m2 && !m2[1].includes("ถูกต้อง")) { found = { t: m2[1].trim(), a: m2[2].trim() }; break; }
         }
         
         if (found) {
           console.log("FOUND via DDG:", found);
           itunesQuery = `${found.t} ${found.a}`;
           fallbackTitle = found.t;
           fallbackArtist = found.a;
           isScraped = true;
         } else {
           console.log("No match found in snips", snips.slice(0,3));
         }
       }
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(itunesQuery)}&country=TH&media=music&limit=${limit}`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();

    if (!data.results || data.results.length === 0) {
       if (isScraped) {
         return [{
            title: fallbackTitle,
            artist: fallbackArtist,
            score: 0.95
         }];
       }
       return [];
    }

    return data.results.map((item, idx) => {
      const title = item.trackName || item.collectionName || query;
      const artist = item.artistName || "ศิลปินไทย";
      
      const bestScore = isScraped ? 0.95 : 0.40;

      return {
        title: title,
        artist: artist,
        score: bestScore
      };
    });
  } catch (err) {
    console.error("Online music search error:", err);
    return [];
  }
}

searchOnlineThaiSongs('ต้องจากบ้านนา ถูกเกณฑ์เข้ามา').then(console.log);
