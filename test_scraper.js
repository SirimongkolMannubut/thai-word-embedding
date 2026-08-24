async function test(query) {
  const ddgQ = encodeURIComponent(query + ' เนื้อเพลง');
  const ddgRes = await fetch('https://html.duckduckgo.com/html/?q=' + ddgQ, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (ddgRes.ok) {
    const text = await ddgRes.text();
    const matches = text.match(/<a class="result__snippet[^>]*>(.*?)<\/a>/g);
    
    const snips = matches ? matches.map(s => s.replace(/<[^>]+>/g, '')) : [];
    
    console.log('Query:', query);
    console.log('Snips:', snips.slice(0, 2));
    
    let found = null;
    for (const snip of snips) {
      // 1. เนื้อเพลง: [Title] ศิลปิน: [Artist]
      const m1 = snip.match(/เนื้อเพลง:?\s*([^\s][^ศ]+?)\s*ศิลปิน:?\s*([^\s][^อ]+?)(?:\s*อัลบั้ม|\s*$|\.\.\.)/);
      if (m1) { found = { t: m1[1].trim(), a: m1[2].trim() }; break; }
      
      // 2. เนื้อเพลง [Title] - [Artist]
      const m2 = snip.match(/เนื้อเพลง\s+([^-]+)\s*-\s*([^-\n]+)/);
      if (m2 && !m2[1].includes('ถูกต้อง') && !m2[1].includes('ที่แสดงบนเว็บ')) { 
        found = { t: m2[1].trim(), a: m2[2].split(' ')[0].trim() }; 
        break; 
      }
      
      // 3. คอร์ดเพลง [Title] จากศิลปิน [Artist]
      const m3 = snip.match(/คอร์ดเพลง\s+([^\s]+)\s+จากศิลปิน\s+([^\s]+)/);
      if (m3) { found = { t: m3[1].trim(), a: m3[2].trim() }; break; }
      
      // 4. เนื้อเพลง [Title] ที่แสดงบนเว็บ... (Siamzone format)
      const m4 = snip.match(/เนื้อเพลง\s+([^\s]+)\s+ที่แสดงบนเว็บ/);
      if (m4) { found = { t: m4[1].trim(), a: '' }; break; }
    }
    
    if (found && found.a.length > 30) {
       found.a = found.a.split(' ')[0]; // Take first word if it's too long garbage
    }
    
    console.log('Found:', found);
    console.log('-----------------');
  }
}
async function run() {
    await test('ก็ไม่ได้คิดเบื่อแต่มันก็คิดถึงเธอ');
    await test('ต่อให้ใครไม่รัก ต่อให้ใครไม่สน');
    await test('ทนได้ทุกทีที่เธอทำช้ำใจ');
    await test('ฉันมันแค่คนคุย ไม่ใช่คนรัก');
    await test('ก็หมวยนี่คะ ไม่ได้ตั้งใจ');
}
run();
