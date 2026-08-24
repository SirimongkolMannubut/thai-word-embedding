async function test() {
  const q = encodeURIComponent('ต้องจากบ้านนา ถูกเกณฑ์เข้ามา เนื้อเพลง');
  const res = await fetch('https://html.duckduckgo.com/html/?q=' + q, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const text = await res.text();
  const matches = text.match(/<a class="result__snippet[^>]*>(.*?)<\/a>/g);
  const titles = text.match(/<a class="result__url" href="[^"]*">([^<]*)<\/a>/g);
  
  console.log(titles ? titles.slice(0, 3) : 'No titles');
  console.log(matches ? matches.slice(0, 3) : 'No matches');
}
test();
