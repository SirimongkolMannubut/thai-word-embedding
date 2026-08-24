async function test() {
  const q = encodeURIComponent('เธอมานั่งโต๊ะริมติดหน้าต่างตรงนั้น เนื้อเพลง');
  const res = await fetch('https://html.duckduckgo.com/html/?q=' + q, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const text = await res.text();
  const matches = text.match(/<a class="result__snippet[^>]*>(.*?)<\/a>/g);
  const titles = text.match(/<a class="result__url" href="[^"]*">([^<]*)<\/a>/g);
  
  const snips = matches ? matches.map(s => s.replace(/<[^>]+>/g, '')) : [];
  const us = titles ? titles.map(t => decodeURIComponent(t.replace(/<[^>]+>/g, '')).trim()) : [];
  console.log('URLs:', us.slice(0, 3));
  console.log('Snips:', snips.slice(0, 3));
}
test();
