// lib/songs.ts
// Hybrid Thai Songs Engine: Local Curated Songs + Live Millions-Song Search Integration

import { getQueryVector, cosineSimilarity } from "./embedding";
import { calculateDetailedMatchScore, DetailedScore, normalizeThaiText } from "./fuzzy";

export interface ThaiSong {
  id: string;
  title: string;
  artist: string;
  moodCategory: string;
  moodTags: string[];
  lyricsSnippet: string;
  fullChorus?: string;
  famousHooks?: string[];
  misheardVariants?: string[];
  gradient: string;
  artworkUrl?: string;
  previewAudioUrl?: string;
  youtubeUrl: string;
  spotifyUrl: string;
  vector?: number[];
  score?: number;
  matchType?: "lyrics" | "semantic" | "title" | "online";
  matchedPhrase?: string;
  detailedScore?: DetailedScore;
}

export const CURATED_THAI_SONGS: ThaiSong[] = [

  // ==================== ลูกทุ่ง / คลาสสิก ====================
  {
    id: "lt-1",
    title: "ไม่มีเวลาไปหาเมียน้อย",
    artist: "ยอดรัก สลักใจ",
    moodCategory: "ลูกทุ่ง / อารมณ์ขัน",
    moodTags: ["ลูกทุ่ง", "เมียน้อย", "ทำงาน", "ไม่มีเวลา"],
    lyricsSnippet: "งานล้นมือจนไม่มีเวลา จะแอบไปหาเมียน้อยได้ยังไง",
    fullChorus: "งานล้นมือจนไม่มีเวลา จะแอบไปหาเมียน้อยได้ยังไง แค่ดูแลเธอคนเดียวก็เหนื่อยจะตาย",
    famousHooks: ["ไม่มีเวลาไปหาเมียน้อย", "อยากมีเวลาไปหาเมียน้อย"],
    misheardVariants: ["อยากมีเวลาไปหาเมียน้อย", "ไม่มีเวลาไปหาเมีย"],
    gradient: "from-amber-700 via-orange-800 to-yellow-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=ไม่มีเวลาไปหาเมียน้อย+ยอดรัก",
    spotifyUrl: "https://open.spotify.com/search/ไม่มีเวลาไปหาเมียน้อย"
  },
  {
    id: "lt-2",
    title: "รักจางที่บางปะกง",
    artist: "สดใส รุ่งโพธิ์ทอง",
    moodCategory: "ลูกทุ่ง / อกหัก",
    moodTags: ["ลูกทุ่ง", "สาวรำวง", "บางปะกง", "อกหัก", "คลาสสิก"],
    lyricsSnippet: "จะซื้อห่อหมกเอาไปฝากป้า ซื้อยอดกะทิเอาไปฝากยาย",
    fullChorus: "จะซื้อห่อหมกเอาไปฝากป้า ซื้อยอดกะทิเอาไปฝากยาย หวังจะให้ชื่นใจ แต่แล้วทำไมถึงมาหลอกกัน รักจางที่บางปะกง",
    famousHooks: ["ซื้อห่อหมกเอาไปฝากป้า", "รักจางที่บางปะกง", "สาวรำวง"],
    misheardVariants: ["หอหมกเอาไปฝากป้า", "ห่อหมกฝากป้า", "ซื้อห่อหมกฝากยาย", "รักจางที่บางประกง"],
    gradient: "from-teal-800 via-emerald-900 to-green-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=รักจางที่บางปะกง",
    spotifyUrl: "https://open.spotify.com/search/รักจางที่บางปะกง"
  },
  {
    id: "lt-3",
    title: "ทบ.2 ลูกอีสาน",
    artist: "ไผ่ พงศธร",
    moodCategory: "ลูกทุ่ง / ชีวิต",
    moodTags: ["ลูกทุ่ง", "ทหารเกณฑ์", "บ้านนา", "คนจน", "อีสาน"],
    lyricsSnippet: "ต้องจากบ้านนา ถูกเกณฑ์เข้ามา เป็นทหารเกณฑ์ ทิ้งเคียวทิ้งเกวียน",
    fullChorus: "ต้องจากบ้านนา ถูกเกณฑ์เข้ามา เป็นทหารเกณฑ์ ทิ้งเคียวทิ้งเกวียน ที่เคยทำนามาจับปืน หนุ่ม ท.บ.2 ลูกอีสาน มาประจำการชายแดนมาเลย์",
    famousHooks: ["ต้องจากบ้านนา ถูกเกณฑ์เข้ามา", "ทบ.2 ลูกอีสาน", "มาประจำการชายแดนมาเลย์"],
    misheardVariants: ["ต้องจากบ้านนา", "ถูกเกณเข้ามา", "ทบ2ลูกอีสาน", "บ้านนาถูกเกณฑ์"],
    gradient: "from-amber-900 via-yellow-900 to-orange-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=ทบ.2+ลูกอีสาน+ไผ่+พงศธร",
    spotifyUrl: "https://open.spotify.com/search/ทบ.2+ลูกอีสาน"
  },
  {
    id: "lt-4",
    title: "สาวนาสั่งแฟน",
    artist: "ไผ่ พงศธร",
    moodCategory: "ลูกทุ่ง / หวาน",
    moodTags: ["ลูกทุ่ง", "สาวนา", "รัก", "ชนบท", "หวาน"],
    lyricsSnippet: "สาวนาสั่งแฟนก่อนจะลา บอกว่ารักกันจริงๆ อย่าทิ้งกันไป",
    fullChorus: "สาวนาสั่งแฟนก่อนจะลา บอกว่ารักกันจริงๆ อย่าทิ้งกันไป จะรอเธอทุกวันคืน ให้กลับมาหา",
    famousHooks: ["สาวนาสั่งแฟน", "อย่าทิ้งกันไป", "จะรอเธอทุกวันคืน"],
    misheardVariants: ["สาวนาสั่งแฟน ไผ่", "สาวนาสั่ง", "สั่งแฟนก่อนลา"],
    gradient: "from-green-700 via-emerald-800 to-lime-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=สาวนาสั่งแฟน+ไผ่+พงศธร",
    spotifyUrl: "https://open.spotify.com/search/สาวนาสั่งแฟน"
  },
  {
    id: "lt-5",
    title: "หนาวแสงนีออน",
    artist: "ธงไชย แมคอินไตย์",
    moodCategory: "ลูกทุ่ง / เศร้า",
    moodTags: ["ลูกทุ่ง", "หนาว", "นีออน", "เมือง", "คิดถึงบ้าน", "เศร้า"],
    lyricsSnippet: "หนาวแสงนีออน กลางดึกคืนนี้ หัวใจหมองเหมือนฟ้าครึ้มฝน",
    fullChorus: "หนาวแสงนีออน กลางดึกคืนนี้ หัวใจหมองเหมือนฟ้าครึ้มฝน นึกถึงน้ำใจ ที่เธอเคยให้ เหงาและโดดเดี่ยว กลางกรุงเทพฯ",
    famousHooks: ["หนาวแสงนีออน", "หัวใจหมองเหมือนฟ้าครึ้มฝน", "กลางกรุงเทพฯ"],
    misheardVariants: ["หนาวแสงนีออน ธงไชย", "หนาวๆแสงนีออน", "แสงนีออนกลางดึก"],
    gradient: "from-blue-900 via-indigo-950 to-slate-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=หนาวแสงนีออน+ธงไชย",
    spotifyUrl: "https://open.spotify.com/search/หนาวแสงนีออน"
  },
  {
    id: "lt-6",
    title: "มนต์รักดอกคำใต้",
    artist: "ศิรินทรา นิยากร",
    moodCategory: "ลูกทุ่ง / โรแมนติก",
    moodTags: ["ลูกทุ่ง", "ดอกคำใต้", "รัก", "คลาสสิก"],
    lyricsSnippet: "ดอกคำใต้บานสะพรั่ง งามสีทองสุกสกาว หอมกลิ่นดอกคำใต้",
    fullChorus: "ดอกคำใต้บานสะพรั่ง งามสีทองสุกสกาว หอมกลิ่นดอกคำใต้ มนต์รักของชาวดอย",
    famousHooks: ["มนต์รักดอกคำใต้", "ดอกคำใต้บานสะพรั่ง", "หอมกลิ่นดอกคำใต้"],
    misheardVariants: ["มนต์รักดอกคำใต้ ศิรินทรา", "ดอกคำใต้", "บานสะพรั่ง"],
    gradient: "from-yellow-600 via-amber-700 to-orange-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=มนต์รักดอกคำใต้+ศิรินทรา",
    spotifyUrl: "https://open.spotify.com/search/มนต์รักดอกคำใต้"
  },

  // ==================== สตริง / ป๊อป ยุค 90s-2000s ====================
  {
    id: "pop-1",
    title: "ยิ้มสู้",
    artist: "เบิร์ด ธงไชย",
    moodCategory: "ป๊อป / กำลังใจ",
    moodTags: ["ป๊อป", "กำลังใจ", "สู้", "ยิ้ม", "บวก"],
    lyricsSnippet: "ยิ้มสู้ แม้ใจจะแสนเจ็บปวด ยิ้มสู้ ต่อให้ชีวิตมันขมขื่น",
    fullChorus: "ยิ้มสู้ แม้ใจจะแสนเจ็บปวด ยิ้มสู้ ต่อให้ชีวิตมันขมขื่น ยิ้มสู้ เพราะชีวิตยังต้องสู้ต่อ อย่าถอย",
    famousHooks: ["ยิ้มสู้", "แม้ใจจะแสนเจ็บปวด", "ต่อให้ชีวิตมันขมขื่น"],
    misheardVariants: ["ยิ้มสู้ เบิร์ด", "แม้ใจเจ็บปวด", "ยิ้มสู้ต่อไป"],
    gradient: "from-yellow-500 via-amber-600 to-orange-700",
    youtubeUrl: "https://www.youtube.com/results?search_query=ยิ้มสู้+เบิร์ด+ธงไชย",
    spotifyUrl: "https://open.spotify.com/search/ยิ้มสู้+ธงไชย"
  },
  {
    id: "pop-2",
    title: "ต่อให้ใครไม่รัก",
    artist: "บอดี้สแลม",
    moodCategory: "ร็อค / กำลังใจ",
    moodTags: ["ร็อค", "กำลังใจ", "แข็งแกร่ง", "ไม่สน", "มั่นใจ"],
    lyricsSnippet: "ต่อให้ใครไม่รัก ต่อให้ใครไม่สน ฉันก็ยังคงมีชีวิตอยู่ได้",
    fullChorus: "ต่อให้ใครไม่รัก ต่อให้ใครไม่สน ต่อให้ใครไม่แคร์ ฉันก็ยังมีชีวิตอยู่ได้ เพราะฉันรักตัวเอง",
    famousHooks: ["ต่อให้ใครไม่รัก", "ต่อให้ใครไม่สน", "ฉันก็ยังมีชีวิตอยู่ได้"],
    misheardVariants: ["ต่อให้ใครไม่รัก บอดี้สแลม", "ไม่รักก็ไม่เป็นไร", "ต่อให้ไม่รัก"],
    gradient: "from-orange-700 via-red-800 to-zinc-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=ต่อให้ใครไม่รัก+บอดี้สแลม",
    spotifyUrl: "https://open.spotify.com/search/ต่อให้ใครไม่รัก+บอดี้สแลม"
  },
  {
    id: "pop-3",
    title: "เพียงชายคนนี้ (ไม่ใช่ผู้วิเศษ)",
    artist: "Instinct",
    moodCategory: "ป๊อป / รัก",
    moodTags: ["ป๊อป", "รัก", "ชายธรรมดา", "หัวใจ"],
    lyricsSnippet: "เพียงชายคนนี้ ที่รักเธออยู่ ไม่ใช่ผู้วิเศษ ไม่มีปีกบิน",
    fullChorus: "เพียงชายคนนี้ ที่รักเธออยู่ ไม่ใช่ผู้วิเศษ ไม่มีปีกบิน แต่หัวใจฉัน มีแต่เธอ",
    famousHooks: ["เพียงชายคนนี้", "ไม่ใช่ผู้วิเศษ", "ไม่มีปีกบิน"],
    misheardVariants: ["เพียงชายคนนี้ Instinct", "ชายคนนี้ไม่ใช่ผู้วิเศษ"],
    gradient: "from-blue-700 via-sky-800 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=เพียงชายคนนี้+Instinct",
    spotifyUrl: "https://open.spotify.com/search/เพียงชายคนนี้"
  },

  // ==================== สตริง / ป๊อป ยุคใหม่ ====================
  {
    id: "mod-1",
    title: "วาดไว้ (Recall)",
    artist: "BOWKYLION",
    moodCategory: "อกหัก / เสียใจ",
    moodTags: ["อกหัก", "ร้องไห้", "คิดถึง", "จากลา"],
    lyricsSnippet: "ที่เธอเคยบอกฉัน อย่าร้องไห้ อยู่ให้ได้ถ้าเธอไม่อยู่",
    fullChorus: "ที่เธอเคยบอกฉัน อย่าร้องไห้ อยู่ให้ได้ถ้าเธอไม่อยู่ ค่อยๆ เรียนรู้การไม่มีเธอ และภาพที่วาดไว้ในใจ จะยังคงสวยงามอยู่เสมอ",
    famousHooks: ["ที่เธอเคยบอกฉัน อย่าร้องไห้", "อยู่ให้ได้ถ้าเธอไม่อยู่", "ภาพที่วาดไว้ในใจ"],
    misheardVariants: ["อย่าร้องห้าย", "อยู่ไห้ได้", "วาตไว้", "ที่เทอเคยบอก"],
    gradient: "from-slate-800 via-indigo-950 to-zinc-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=วาดไว้+BOWKYLION",
    spotifyUrl: "https://open.spotify.com/search/วาดไว้%20BOWKYLION"
  },
  {
    id: "mod-2",
    title: "เลือดกรุ๊ปบี (B Blood Type)",
    artist: "Chrrissa (เอิ้ก ชาลิสา)",
    moodCategory: "อกหัก / ตัดพ้อ",
    moodTags: ["อกหัก", "ตัดพ้อ", "โสด", "ดวง", "เศร้า"],
    lyricsSnippet: "หรือเป็นเพราะเลือดกรุ๊ปบีหรือเปล่า ต้องมีน้ำตาคลอเบ้าอยู่ร่ำไป",
    fullChorus: "หรือเป็นเพราะเลือดกรุ๊ปบีหรือเปล่า ที่ทำให้ฉันต้องเหงาและไม่มีใคร ต้องมีน้ำตาคลอเบ้าอยู่ร่ำไป",
    famousHooks: ["หรือเป็นเพราะเลือดกรุ๊ปบีหรือเปล่า", "มีน้ำตาคลอเบ้า", "เลือดกรุ๊ปบี"],
    misheardVariants: ["เลือดกุ๊ปบี", "เลือดกรุปบี", "เลือดกรุ๊ปบีรึป่าว"],
    gradient: "from-rose-950 via-purple-950 to-slate-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=เลือดกรุ๊ปบี+Chrrissa",
    spotifyUrl: "https://open.spotify.com/search/เลือดกรุ๊ปบี"
  },
  {
    id: "mod-3",
    title: "ทรงอย่างแบด (Bad Boy)",
    artist: "Paper Planes",
    moodCategory: "ร็อค / สนุก",
    moodTags: ["สนุก", "มันส์", "ร็อค", "แดนซ์"],
    lyricsSnippet: "ทรงอย่างแบด แซดอย่างบ่อย เธอเข้ามาอ่อยแล้วก็ทิ้งไป",
    fullChorus: "ทรงอย่างแบด แซดอย่างบ่อย เธอเข้ามาอ่อยแล้วก็ทิ้งไป ปล่อยเธอไปกับเขาก็ดีแล้ว ฉันมันแบดบอยไม่คู่ควรกับเธอ",
    famousHooks: ["ทรงอย่างแบด แซดอย่างบ่อย", "เธอเข้ามาอ่อยแล้วก็ทิ้งไป"],
    misheardVariants: ["ทรงยังแบด", "แซดอย่างบอย", "เปเปอเพลน"],
    gradient: "from-red-600 via-orange-600 to-zinc-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=ทรงอย่างแบด+Paper+Planes",
    spotifyUrl: "https://open.spotify.com/search/ทรงอย่างแบด"
  },
  {
    id: "mod-4",
    title: "โต๊ะริม (Melt)",
    artist: "NONT TANONT",
    moodCategory: "ชิล / คาเฟ่",
    moodTags: ["ชิล", "คาเฟ่", "กาแฟ", "สบาย", "น่ารัก"],
    lyricsSnippet: "เธอมานั่งโต๊ะริมติดหน้าต่างตรงนั้น สบตาเพียงแป๊บเดียวใจก็ละลาย",
    fullChorus: "เธอมานั่งโต๊ะริมติดหน้าต่างตรงนั้น สบตาเพียงแป๊บเดียวใจก็ละลายไปกับเธอ กลิ่นกาแฟยังไม่หอมเท่ารอยยิ้มเธอเลย",
    famousHooks: ["เธอมานั่งโต๊ะริมติดหน้าต่างตรงนั้น", "สบตาเพียงแป๊บเดียวใจก็ละลาย", "โต๊ะริม"],
    misheardVariants: ["โตะริม", "โต๊ะริมติดน่าต่าง", "ใจละลายไปกับเธอ"],
    gradient: "from-cyan-600 via-teal-600 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=โต๊ะริม+NONT+TANONT",
    spotifyUrl: "https://open.spotify.com/search/โต๊ะริม%20NONT%20TANONT"
  },
  {
    id: "mod-5",
    title: "น่ารักชิปปุ๋ง (Puppy)",
    artist: "BOWKYLION",
    moodCategory: "แอบชอบ / น่ารัก",
    moodTags: ["น่ารัก", "ชอบ", "ใจฟู", "แอบชอบ", "คลั่งรัก"],
    lyricsSnippet: "น่ารักชิปปุ๋งเลยอ่ะเธอ มองทีไรใจก็ละลายไปหมดแล้ว",
    fullChorus: "น่ารักชิปปุ๋งเลยอ่ะเธอ มองทีไรใจก็ละลายไปหมดแล้ว ทำไมน่ารักได้ขนาดนี้ หัวใจฉันรับไม่ไหวแล้วนะเธอ",
    famousHooks: ["น่ารักชิปปุ๋งเลยอ่ะเธอ", "มองทีไรใจก็ละลาย"],
    misheardVariants: ["น่ารักชิบปุ๋ง", "น่ารักชิบปุงเลยอะเธอ"],
    gradient: "from-pink-600 via-rose-500 to-amber-300",
    youtubeUrl: "https://www.youtube.com/results?search_query=น่ารักชิปปุ๋ง+BOWKYLION",
    spotifyUrl: "https://open.spotify.com/search/น่ารักชิปปุ๋ง"
  },
  {
    id: "mod-6",
    title: "ทักครับ",
    artist: "Lipta ft. GUYGEEGEE",
    moodCategory: "แอบชอบ / กวนๆ",
    moodTags: ["จีบ", "แอบชอบ", "ทักแชท", "น่ารัก"],
    lyricsSnippet: "ทักครับ เธอชื่ออะไรอ่ะ มีแฟนหรือยัง ถ้ายังไม่มีขอจีบได้ไหม",
    fullChorus: "ทักครับ เธอชื่ออะไรอ่ะ มีแฟนหรือยัง ถ้ายังไม่มีขอจีบได้ไหม แค่อยากจะทักทายคุยด้วยสักหน่อยคนน่ารัก",
    famousHooks: ["ทักครับ เธอชื่ออะไรอ่ะ", "มีแฟนหรือยัง", "ถ้ายังไม่มีขอจีบได้ไหม"],
    misheardVariants: ["ทักคราฟ", "ทักคับ", "เทอชื่ออะไรอะ", "ขอจีบได้มั้ย"],
    gradient: "from-yellow-500 via-orange-500 to-rose-600",
    youtubeUrl: "https://www.youtube.com/results?search_query=ทักครับ+Lipta",
    spotifyUrl: "https://open.spotify.com/search/ทักครับ%20Lipta"
  },
  {
    id: "mod-7",
    title: "นะหน้าทอง",
    artist: "โจอี้ ภูวศิษฐ์",
    moodCategory: "หลงรัก / ร่ายมนตร์",
    moodTags: ["หลงรัก", "คาถา", "เสน่ห์", "อีสาน"],
    lyricsSnippet: "เป่าคาถา มหาระรวย ให้เธอหลงรักจนหมดหัวใจ",
    fullChorus: "ฉันจะเป่าคาถา มหาระรวย ให้เธอหลงรักจนหมดหัวใจ มีแต่ฉันคนเดียวในสายตา",
    famousHooks: ["เป่าคาถา มหาระรวย", "ให้เธอหลงรักจนหมดหัวใจ", "นะหน้าทอง"],
    misheardVariants: ["เป่าคาถามหาระรวย", "มหาระรวย", "คาถานะหน้าทอง"],
    gradient: "from-amber-600 via-yellow-700 to-stone-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=นะหน้าทอง+โจอี้",
    spotifyUrl: "https://open.spotify.com/search/นะหน้าทอง"
  },
  {
    id: "mod-8",
    title: "ทนได้ทุกที",
    artist: "TaitosmitH",
    moodCategory: "อกหัก / เจ็บปวด",
    moodTags: ["อกหัก", "ทน", "เจ็บ", "ช้ำ", "รัก"],
    lyricsSnippet: "ทนได้ทุกที ที่เธอทำให้ฉันเจ็บ เจ็บและช้ำมากี่ครั้ง พลาดและพลั้งมากี่หน",
    fullChorus: "ทนได้ทุกทีที่เธอทำให้ฉันเจ็บ เจ็บและช้ำมากี่ครั้ง ทนได้ทุกทีที่เธอทำช้ำใจ แต่ทนไม่ได้ถ้าเธอจะจากไป",
    famousHooks: ["ทนได้ทุกที", "เจ็บและช้ำมากี่ครั้ง", "ทนไม่ได้ถ้าเธอจะจากไป"],
    misheardVariants: ["ทนได้ทุกทีที่เธอทำช้ำใจ", "ทนได้ทุกทีที่เธอ", "ทนทุกที TaitosmitH"],
    gradient: "from-rose-800 via-red-900 to-zinc-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=ทนได้ทุกที+TaitosmitH",
    spotifyUrl: "https://open.spotify.com/search/ทนได้ทุกที+TaitosmitH"
  },
  {
    id: "mod-9",
    title: "แค่คนคุย",
    artist: "Lipta",
    moodCategory: "อกหัก / Friend Zone",
    moodTags: ["เพื่อน", "แอบชอบ", "friendzone", "คนคุย", "เจ็บ"],
    lyricsSnippet: "ฉันมันแค่คนคุย ไม่ใช่คนรัก แค่คนที่เธอโทรมาเมื่อเศร้าหรืองาน",
    fullChorus: "ฉันมันแค่คนคุย ไม่ใช่คนรัก แค่คนที่เธอโทรมาเมื่อเศร้า หรืองาน ฉันรู้ดี แต่ก็ยังรอ",
    famousHooks: ["ฉันมันแค่คนคุย", "ไม่ใช่คนรัก", "แค่คนที่เธอโทรมาเมื่อเศร้า"],
    misheardVariants: ["แค่คนคุย ไม่ใช่คนรัก", "คนคุย Lipta", "ฉันแค่คนคุย"],
    gradient: "from-slate-700 via-gray-800 to-zinc-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=แค่คนคุย+Lipta",
    spotifyUrl: "https://open.spotify.com/search/แค่คนคุย+Lipta"
  },
  {
    id: "mod-10",
    title: "14 อีกครั้ง",
    artist: "Mild",
    moodCategory: "ป๊อป / คิดถึง",
    moodTags: ["คิดถึง", "รัก", "หวาน", "ความทรงจำ"],
    lyricsSnippet: "ก็ไม่ได้คิดเบื่อ แต่มันก็คิดถึงเธอ ทุกที่ที่ฉันไป",
    fullChorus: "ก็ไม่ได้คิดเบื่อ แต่มันก็คิดถึงเธอ ทุกที่ที่ฉันไป เหมือนเธออยู่ใกล้ๆ ตลอดเวลา",
    famousHooks: ["ก็ไม่ได้คิดเบื่อแต่มันก็คิดถึงเธอ", "14 อีกครั้ง", "ทุกที่ที่ฉันไป"],
    misheardVariants: ["ไม่ได้คิดเบื่อแต่ก็คิดถึงเธอ", "คิดถึงเธอทุกที่", "14 อีกครั้ง Mild"],
    gradient: "from-indigo-700 via-blue-800 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=14+อีกครั้ง+Mild",
    spotifyUrl: "https://open.spotify.com/search/14+อีกครั้ง+Mild"
  },
  {
    id: "mod-11",
    title: "สายฝน",
    artist: "บอดี้สแลม",
    moodCategory: "ร็อค / เหงา",
    moodTags: ["ร็อค", "ฝน", "เหงา", "คิดถึง", "เศร้า"],
    lyricsSnippet: "สายฝนที่โปรยปราย ชวนให้หัวใจเหงา คิดถึงเธอทุกวัน",
    fullChorus: "สายฝนที่โปรยปราย ชวนให้หัวใจเหงา คิดถึงเธอทุกวัน ฝนตกทุกครั้งที่ฉันคิดถึงเธอ",
    famousHooks: ["สายฝน", "สายฝนที่โปรยปราย", "ชวนให้หัวใจเหงา"],
    misheardVariants: ["สายฝน บอดี้สแลม", "ฝนโปรยปราย", "ฝนตกคิดถึงเธอ"],
    gradient: "from-sky-800 via-blue-900 to-slate-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=สายฝน+บอดี้สแลม",
    spotifyUrl: "https://open.spotify.com/search/สายฝน+บอดี้สแลม"
  },
  {
    id: "mod-12",
    title: "สักวันฉันจะดีพอ",
    artist: "Bedroom Audio",
    moodCategory: "ป๊อป / กำลังใจ",
    moodTags: ["กำลังใจ", "ความพยายาม", "ดีพอ", "รอ", "วันหนึ่ง"],
    lyricsSnippet: "สักวันฉันจะดีพอ สักวันฉันจะเก่งพอ ให้เธอภูมิใจในตัวฉัน",
    fullChorus: "สักวันฉันจะดีพอ สักวันฉันจะเก่งพอ ให้เธอภูมิใจในตัวฉัน อย่าเพิ่งทิ้งฉันไปนะ",
    famousHooks: ["สักวันฉันจะดีพอ", "สักวันฉันจะเก่งพอ", "ให้เธอภูมิใจในตัวฉัน"],
    misheardVariants: ["สักวันจะดีพอ", "ดีพอ Bedroom Audio", "วันนึงจะดีพอ"],
    gradient: "from-purple-700 via-violet-800 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=สักวันฉันจะดีพอ+Bedroom+Audio",
    spotifyUrl: "https://open.spotify.com/search/สักวันฉันจะดีพอ"
  },
  {
    id: "mod-13",
    title: "คนไม่คุย (Silent Mode)",
    artist: "Proxie",
    moodCategory: "อกหัก / เย็นชา",
    moodTags: ["อกหัก", "เย็นชา", "ไม่คุย", "เงียบ", "ห่างเหิน"],
    lyricsSnippet: "ก็เหมือนไม่ค่อยแคร์ ก็เหมือนไม่ดูแล ตอบไลน์เธอก็ช้า",
    fullChorus: "ก็เหมือนไม่ค่อยแคร์ ก็เหมือนไม่ดูแล ตอบไลน์เธอก็ช้า คุยกันก็เหมือน Silent Mode",
    famousHooks: ["คนไม่คุย", "Silent Mode", "ตอบไลน์เธอก็ช้า", "เหมือนไม่ค่อยแคร์"],
    misheardVariants: ["คนไม่คุย Proxie", "ไม่คุย ไม่แคร์", "silent mode เพลง"],
    gradient: "from-gray-700 via-slate-800 to-zinc-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=คนไม่คุย+Proxie",
    spotifyUrl: "https://open.spotify.com/search/คนไม่คุย+Proxie"
  },

  // ==================== อกหัก / เศร้า ====================
  {
    id: "sad-1",
    title: "เพื่อน (Friend)",
    artist: "บอดี้สแลม",
    moodCategory: "ร็อค / มิตรภาพ",
    moodTags: ["เพื่อน", "ร็อค", "มิตรภาพ", "ซึ้ง"],
    lyricsSnippet: "เพื่อนเอ๋ยเพื่อน เธอรู้ไหม ฉันนับถือเธอ ในฐานะเพื่อนแท้",
    fullChorus: "เพื่อนเอ๋ยเพื่อน เธอรู้ไหม ฉันนับถือเธอ ในฐานะเพื่อนแท้ จะคอยอยู่เคียงข้างเธอ",
    famousHooks: ["เพื่อนเอ๋ยเพื่อน", "ฉันนับถือเธอ", "เพื่อนแท้"],
    misheardVariants: ["เพื่อน บอดี้สแลม", "เธอรู้ไหมว่าฉันนับถือ"],
    gradient: "from-blue-700 via-indigo-800 to-slate-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=เพื่อน+บอดี้สแลม",
    spotifyUrl: "https://open.spotify.com/search/เพื่อน+บอดี้สแลม"
  },
  {
    id: "sad-2",
    title: "เธอยังนอนหลับอยู่",
    artist: "Lula",
    moodCategory: "ป๊อป / เศร้า",
    moodTags: ["เศร้า", "คิดถึง", "รัก", "ห่วงใย"],
    lyricsSnippet: "เธอยังนอนหลับอยู่ ไม่รู้สึกตัวเลยว่า ฉันนั่งมองเธออยู่",
    fullChorus: "เธอยังนอนหลับอยู่ ไม่รู้สึกตัวเลยว่า ฉันนั่งมองเธออยู่ ทั้งคืนด้วยความรัก",
    famousHooks: ["เธอยังนอนหลับอยู่", "ฉันนั่งมองเธออยู่ทั้งคืน"],
    misheardVariants: ["เธอยังนอนหลับ Lula", "นอนหลับอยู่ไม่รู้สึก"],
    gradient: "from-violet-800 via-purple-900 to-slate-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=เธอยังนอนหลับอยู่+Lula",
    spotifyUrl: "https://open.spotify.com/search/เธอยังนอนหลับอยู่"
  },
  {
    id: "sad-3",
    title: "รักเธอ (ทั้งที่รู้ว่าเธอไม่รัก)",
    artist: "Potato",
    moodCategory: "ป๊อป / เจ็บปวด",
    moodTags: ["รัก", "เจ็บ", "อกหัก", "รักฝ่ายเดียว"],
    lyricsSnippet: "รักเธอทั้งที่รู้ว่าเธอไม่รัก แต่จะหยุดรักก็ทำไม่ได้",
    fullChorus: "รักเธอทั้งที่รู้ว่าเธอไม่รัก แต่จะหยุดรักก็ทำไม่ได้ ใจมันสั่งให้รัก แต่เธอไม่รู้สึก",
    famousHooks: ["รักเธอทั้งที่รู้ว่าเธอไม่รัก", "จะหยุดรักก็ทำไม่ได้"],
    misheardVariants: ["รักทั้งที่รู้ว่าไม่รัก", "Potato รัก"],
    gradient: "from-rose-800 via-pink-900 to-slate-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=รักเธอทั้งที่รู้ว่าเธอไม่รัก+Potato",
    spotifyUrl: "https://open.spotify.com/search/รักเธอทั้งที่รู้ว่าเธอไม่รัก"
  },
  {
    id: "sad-4",
    title: "กลับมาได้ไหม",
    artist: "BIG ASS",
    moodCategory: "ร็อค / อกหัก",
    moodTags: ["อกหัก", "ร็อค", "คิดถึง", "อยากคืนดี"],
    lyricsSnippet: "กลับมาได้ไหม กลับมาหาฉัน ยังรักเธออยู่ จะรอเธอทุกวัน",
    fullChorus: "กลับมาได้ไหม กลับมาหาฉัน ยังรักเธออยู่ จะรอเธอทุกวัน กลับมาเถอะนะ",
    famousHooks: ["กลับมาได้ไหม", "ยังรักเธออยู่", "จะรอเธอทุกวัน"],
    misheardVariants: ["กลับมาไหม BIG ASS", "กลับมาหาฉัน"],
    gradient: "from-orange-700 via-red-800 to-zinc-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=กลับมาได้ไหม+BIG+ASS",
    spotifyUrl: "https://open.spotify.com/search/กลับมาได้ไหม+BIG+ASS"
  },

  // ==================== อินดี้ / ชิล ====================
  {
    id: "indie-1",
    title: "ขอบคุณ (ที่รักกัน)",
    artist: "Scrubb",
    moodCategory: "อินดี้ / ซึ้ง",
    moodTags: ["ขอบคุณ", "รัก", "ซึ้ง", "หวาน", "อินดี้"],
    lyricsSnippet: "ขอบคุณที่รักกัน ขอบคุณที่อยู่เคียงข้างกัน ตลอดมา",
    fullChorus: "ขอบคุณที่รักกัน ขอบคุณที่อยู่เคียงข้างกันตลอดมา ขอบคุณที่ไม่เคยทิ้งกัน",
    famousHooks: ["ขอบคุณที่รักกัน", "ขอบคุณที่อยู่เคียงข้าง"],
    misheardVariants: ["ขอบคุณ Scrubb", "ขอบคุณที่รักกัน Scrubb"],
    gradient: "from-emerald-700 via-teal-800 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=ขอบคุณ+Scrubb",
    spotifyUrl: "https://open.spotify.com/search/ขอบคุณ+Scrubb"
  },
  {
    id: "indie-2",
    title: "ป่านนี้",
    artist: "Lula",
    moodCategory: "อินดี้ / คิดถึง",
    moodTags: ["คิดถึง", "อดีต", "รัก", "เศร้า", "อินดี้"],
    lyricsSnippet: "ป่านนี้เธออยู่ที่ไหน ยังดีอยู่ไหม มีคนดูแลไหม",
    fullChorus: "ป่านนี้เธออยู่ที่ไหน ยังดีอยู่ไหม มีคนดูแลไหม ฉันก็ยังคิดถึงเธออยู่เสมอ",
    famousHooks: ["ป่านนี้เธออยู่ที่ไหน", "ยังดีอยู่ไหม", "ฉันก็ยังคิดถึง"],
    misheardVariants: ["ป่านนี้ Lula", "ป่านนี้เธออยู่ไหน"],
    gradient: "from-purple-700 via-indigo-800 to-slate-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=ป่านนี้+Lula",
    spotifyUrl: "https://open.spotify.com/search/ป่านนี้+Lula"
  },

  // ==================== เพลงฮิต TikTok / Gen Z ====================
  {
    id: "tiktok-1",
    title: "ดาวกระจาย",
    artist: "MILLI",
    moodCategory: "ฮิปฮอป / มั่นใจ",
    moodTags: ["ฮิปฮอป", "มั่นใจ", "แรป", "เท่", "กล้า"],
    lyricsSnippet: "ฉันดาวกระจาย ส่องสว่างทุกทาง ไม่ต้องพึ่งใครนะ",
    fullChorus: "ฉันดาวกระจาย ส่องสว่างทุกทาง ไม่ต้องพึ่งใครนะ ฉันเองก็เพียงพอ",
    famousHooks: ["ฉันดาวกระจาย", "ส่องสว่างทุกทาง", "ดาวกระจาย MILLI"],
    misheardVariants: ["ดาวกระจาย Milli", "ดาวกระจาย แรป"],
    gradient: "from-yellow-400 via-amber-500 to-orange-600",
    youtubeUrl: "https://www.youtube.com/results?search_query=ดาวกระจาย+MILLI",
    spotifyUrl: "https://open.spotify.com/search/ดาวกระจาย+MILLI"
  },
  {
    id: "tiktok-2",
    title: "อกหักเหมือนกัน",
    artist: "Jeff Satur",
    moodCategory: "ป๊อป / อกหัก",
    moodTags: ["อกหัก", "รัก", "เจ็บ", "เศร้า", "Jeff Satur"],
    lyricsSnippet: "อกหักเหมือนกัน เราเลยมาเจอกัน ต่างคนต่างเจ็บ",
    fullChorus: "อกหักเหมือนกัน เราเลยมาเจอกัน ต่างคนต่างเจ็บ ต่างคนต่างเหงา",
    famousHooks: ["อกหักเหมือนกัน", "ต่างคนต่างเจ็บ"],
    misheardVariants: ["อกหักเหมือนกัน Jeff Satur", "เจ็บเหมือนกัน"],
    gradient: "from-rose-700 via-pink-800 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=อกหักเหมือนกัน+Jeff+Satur",
    spotifyUrl: "https://open.spotify.com/search/อกหักเหมือนกัน+Jeff+Satur"
  },
  {
    id: "tiktok-3",
    title: "ลืมเธอได้ก็ดี",
    artist: "ATLAS",
    moodCategory: "ป๊อป / อกหัก",
    moodTags: ["อกหัก", "ลืม", "เจ็บ", "ก้าวข้าม"],
    lyricsSnippet: "ลืมเธอได้ก็ดี แต่มันทำไม่ได้ ยังคิดถึงเธออยู่",
    fullChorus: "ลืมเธอได้ก็ดี แต่มันทำไม่ได้ ยังคิดถึงเธออยู่ ทุกเช้าทุกคืน",
    famousHooks: ["ลืมเธอได้ก็ดี", "แต่มันทำไม่ได้", "ยังคิดถึงเธออยู่"],
    misheardVariants: ["ลืมเธอได้ก็ดี ATLAS", "ลืมได้ก็ดี"],
    gradient: "from-indigo-700 via-purple-800 to-slate-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=ลืมเธอได้ก็ดี+ATLAS",
    spotifyUrl: "https://open.spotify.com/search/ลืมเธอได้ก็ดี"
  },
  {
    id: "tiktok-4",
    title: "ตัวเองก็พอ",
    artist: "Stamp",
    moodCategory: "ป๊อป / มั่นใจ",
    moodTags: ["มั่นใจ", "รักตัวเอง", "พอ", "กำลังใจ"],
    lyricsSnippet: "ตัวเองก็พอ ไม่ต้องมีใครก็ได้ ฉันรักตัวเองมากพอแล้ว",
    fullChorus: "ตัวเองก็พอ ไม่ต้องมีใครก็ได้ ฉันรักตัวเองมากพอแล้ว จะทำให้ตัวเองมีความสุข",
    famousHooks: ["ตัวเองก็พอ", "ไม่ต้องมีใครก็ได้", "ฉันรักตัวเอง"],
    misheardVariants: ["ตัวเองก็พอ Stamp", "พอแล้ว รักตัวเอง"],
    gradient: "from-emerald-600 via-teal-700 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=ตัวเองก็พอ+Stamp",
    spotifyUrl: "https://open.spotify.com/search/ตัวเองก็พอ+Stamp"
  },

  // ==================== เพลงฮิต ยุคใหม่ 2024-2025 ====================
  {
    id: "new-1",
    title: "หมวยนี่คะ",
    artist: "China Dolls",
    moodCategory: "ป๊อป / ตลก",
    moodTags: ["ตลก", "หมวย", "จีน", "น่ารัก", "เบาๆ"],
    lyricsSnippet: "หมวยนี่คะ ไม่ได้ตั้งใจ ฉันไม่รู้เรื่องอะไรเลย",
    fullChorus: "หมวยนี่คะ ไม่ได้ตั้งใจ ฉันไม่รู้เรื่องอะไรเลย อาหมวย อาหมวย",
    famousHooks: ["หมวยนี่คะ", "ไม่ได้ตั้งใจ", "อาหมวย"],
    misheardVariants: ["ก็หมวยนี่คะ", "หมวยนี้คะ China Dolls"],
    gradient: "from-red-600 via-pink-700 to-rose-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=หมวยนี่คะ+China+Dolls",
    spotifyUrl: "https://open.spotify.com/search/หมวยนี่คะ"
  },
  {
    id: "new-2",
    title: "เธอนั่งอยู่ข้างๆ ฉันไม่ได้รู้สึก",
    artist: "Yokee Playboy",
    moodCategory: "ป๊อป / อกหัก",
    moodTags: ["อกหัก", "ไม่รู้สึก", "สิ้นรัก", "จบแล้ว"],
    lyricsSnippet: "เธอนั่งอยู่ข้างๆ ฉันไม่ได้รู้สึกอะไรอีกแล้ว",
    fullChorus: "เธอนั่งอยู่ข้างๆ ฉันไม่ได้รู้สึกอะไรอีกแล้ว แล้วเราจะอยู่ด้วยกันไปเพื่ออะไร",
    famousHooks: ["เธอนั่งอยู่ข้างๆ ฉันไม่ได้รู้สึก", "จะอยู่ด้วยกันไปเพื่ออะไร"],
    misheardVariants: ["นั่งข้างๆ ไม่รู้สึก", "ไม่รู้สึกอะไรแล้ว"],
    gradient: "from-gray-700 via-slate-800 to-zinc-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=เธอนั่งอยู่ข้างๆ+Yokee+Playboy",
    spotifyUrl: "https://open.spotify.com/search/เธอนั่งอยู่ข้างๆ"
  },
  {
    id: "new-3",
    title: "สักวันเธอจะเข้าใจ",
    artist: "Season Five",
    moodCategory: "ป๊อป / รัก",
    moodTags: ["รัก", "รอ", "เข้าใจ", "หวัง"],
    lyricsSnippet: "สักวันเธอจะเข้าใจว่า ฉันรักเธอแค่ไหน",
    fullChorus: "สักวันเธอจะเข้าใจว่า ฉันรักเธอแค่ไหน รักมากแค่ไหน ที่ไม่เคยบอก",
    famousHooks: ["สักวันเธอจะเข้าใจ", "ฉันรักเธอแค่ไหน"],
    misheardVariants: ["สักวันจะเข้าใจ Season Five", "เธอจะเข้าใจสักวัน"],
    gradient: "from-violet-700 via-purple-800 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=สักวันเธอจะเข้าใจ+Season+Five",
    spotifyUrl: "https://open.spotify.com/search/สักวันเธอจะเข้าใจ"
  },
  {
    id: "new-4",
    title: "เพลงของเรา",
    artist: "Scrubb",
    moodCategory: "อินดี้ / โรแมนติก",
    moodTags: ["โรแมนติก", "รัก", "เพลง", "ความทรงจำ", "อินดี้"],
    lyricsSnippet: "เพลงของเรา ที่เราเคยฟังด้วยกัน ทุกครั้งที่ได้ยิน ก็คิดถึงเธอ",
    fullChorus: "เพลงของเรา ที่เราเคยฟังด้วยกัน ทุกครั้งที่ได้ยิน ก็คิดถึงเธอทันที",
    famousHooks: ["เพลงของเรา", "เพลงที่เราเคยฟังด้วยกัน", "ก็คิดถึงเธอ"],
    misheardVariants: ["เพลงของเรา Scrubb", "เพลงเราสองคน"],
    gradient: "from-teal-600 via-cyan-700 to-slate-900",
    youtubeUrl: "https://www.youtube.com/results?search_query=เพลงของเรา+Scrubb",
    spotifyUrl: "https://open.spotify.com/search/เพลงของเรา+Scrubb"
  },

  // ==================== เพลงร็อค / อัลเทอร์เนทิฟ ====================
  {
    id: "rock-1",
    title: "คนแปลกหน้า",
    artist: "Slot Machine",
    moodCategory: "ร็อค / จบรัก",
    moodTags: ["ร็อค", "จบรัก", "แปลกหน้า", "เจ็บ", "อกหัก"],
    lyricsSnippet: "จากคนรักกันมาเป็นคนแปลกหน้า ไม่รู้จะพูดอะไรเวลาเจอกัน",
    fullChorus: "จากคนรักกัน มาเป็นคนแปลกหน้า ไม่รู้จะพูดอะไรเวลาเจอกัน มันเจ็บจริงๆ",
    famousHooks: ["คนแปลกหน้า", "จากคนรักกันมาเป็นคนแปลกหน้า"],
    misheardVariants: ["คนแปลกหน้า Slot Machine", "เป็นคนแปลกหน้ากันแล้ว"],
    gradient: "from-slate-700 via-gray-800 to-zinc-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=คนแปลกหน้า+Slot+Machine",
    spotifyUrl: "https://open.spotify.com/search/คนแปลกหน้า+Slot+Machine"
  },
  {
    id: "rock-2",
    title: "ยังคิดถึงอยู่",
    artist: "Silly Fools",
    moodCategory: "ร็อค / คิดถึง",
    moodTags: ["ร็อค", "คิดถึง", "อดีต", "รัก", "เศร้า"],
    lyricsSnippet: "ยังคิดถึงอยู่ ทุกวันทุกคืน ไม่เคยลืมเธอได้เลย",
    fullChorus: "ยังคิดถึงอยู่ ทุกวันทุกคืน ไม่เคยลืมเธอได้เลย เธอยังอยู่ในใจ",
    famousHooks: ["ยังคิดถึงอยู่", "ทุกวันทุกคืน", "ไม่เคยลืมเธอ"],
    misheardVariants: ["ยังคิดถึงอยู่ Silly Fools", "คิดถึงทุกวันทุกคืน"],
    gradient: "from-red-800 via-orange-900 to-zinc-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=ยังคิดถึงอยู่+Silly+Fools",
    spotifyUrl: "https://open.spotify.com/search/ยังคิดถึงอยู่+Silly+Fools"
  },

  // ==================== R&B / Soul ====================
  {
    id: "rnb-1",
    title: "ใจเย็นๆ",
    artist: "หิน เหล็ก ไฟ",
    moodCategory: "ร็อค / มันส์",
    moodTags: ["ร็อค", "มันส์", "สนุก", "ใจเย็น"],
    lyricsSnippet: "ใจเย็นๆ นะ ใจเย็นๆ หน่อยได้ไหม อย่าเพิ่งรีบ",
    fullChorus: "ใจเย็นๆ นะ ใจเย็นๆ หน่อยได้ไหม อย่าเพิ่งรีบ ช้าๆ ก็ได้",
    famousHooks: ["ใจเย็นๆ", "ใจเย็นๆ หน่อยได้ไหม"],
    misheardVariants: ["ใจเย็น หิน เหล็ก ไฟ", "ใจเย็นหน่อย"],
    gradient: "from-orange-600 via-amber-700 to-stone-950",
    youtubeUrl: "https://www.youtube.com/results?search_query=ใจเย็นๆ+หิน+เหล็ก+ไฟ",
    spotifyUrl: "https://open.spotify.com/search/ใจเย็น+หิน+เหล็ก+ไฟ"
  }

];

// Initialize Curated Song Vectors
CURATED_THAI_SONGS.forEach(song => {
  const combinedText = `${song.title} ${song.artist} ${song.moodCategory} ${song.moodTags.join(" ")} ${song.lyricsSnippet} ${song.fullChorus || ""}`;
  song.vector = getQueryVector(combinedText);
});

// Live Online Music Search via iTunes API (Free, Instant, Covers ALL Thai Songs)
// Upgraded: Uses DuckDuckGo HTML fallback to resolve Lyrics into Title/Artist!
export async function searchOnlineThaiSongs(query: string, limit = 6): Promise<ThaiSong[]> {
  try {
    let itunesQuery = query;
    let fallbackTitle = query;
    let fallbackArtist = "ศิลปินไทย";
    let isScraped = false;

    // If query looks like a lyric sentence, scrape DDG for Title/Artist
    if (query.trim().length > 15 && query.includes(" ")) {
      const ddgQ = encodeURIComponent(query.trim() + " เนื้อเพลง");
      const ddgRes = await fetch("https://html.duckduckgo.com/html/?q=" + ddgQ, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        next: { revalidate: 3600 }
      });

      if (ddgRes.ok) {
        const text = await ddgRes.text();
        const matches = text.match(/<a class="result__snippet[^>]*>(.*?)<\/a>/g);
        const snips = matches ? matches.map(s => s.replace(/<[^>]+>/g, '')) : [];
        
        let found: {t: string, a: string} | null = null;
        
        // Pass 1: High confidence patterns (Title & Artist)
        for (const snip of snips) {
          // Pattern 1: เนื้อเพลง: โต๊ะริม ศิลปิน: นนท์ ธนนท์
          const m1 = snip.match(/เนื้อเพลง:?\s*([^\s][^ศ]+?)\s*ศิลปิน:?\s*([^\s][^อ]+?)(?:\s*อัลบั้ม|\s*$|\.\.\.)/);
          if (m1) { found = { t: m1[1].trim(), a: m1[2].trim() }; break; }
          
          // Pattern 2: เนื้อเพลง โต๊ะริม - นนท์ ธนนท์
          const m2 = snip.match(/เนื้อเพลง\s+([^-]+)\s*-\s*([^-\n]+)/);
          if (m2 && !m2[1].includes("ถูกต้อง") && !m2[1].includes("ที่แสดงบนเว็บ")) { 
            found = { t: m2[1].trim(), a: m2[2].split(" ")[0].trim() }; 
            break; 
          }
        }

        // Pass 2: Fallback patterns (Title only or weird formats)
        if (!found) {
          for (const snip of snips) {
            // Pattern 3: คอร์ดเพลง โต๊ะริม จากศิลปิน นนท์
            const m3 = snip.match(/คอร์ดเพลง\s+([^\s]+)\s+จากศิลปิน\s+([^\s]+)/);
            if (m3) { found = { t: m3[1].trim(), a: m3[2].trim() }; break; }
            
            // Pattern 4: เนื้อเพลง โต๊ะริม ที่แสดงบนเว็บ (Siamzone)
            const m4 = snip.match(/เนื้อเพลง\s+([^\s]+)\s+ที่แสดงบนเว็บ/);
            if (m4) { found = { t: m4[1].trim(), a: "" }; break; }
          }
        }

        if (found) {
          if (found.a && found.a.length > 30) found.a = found.a.split(" ")[0]; // Clean long trailing garbage
          
          itunesQuery = `${found.t} ${found.a}`.trim();
          fallbackTitle = found.t;
          fallbackArtist = found.a || "ศิลปินไทย";
          isScraped = true;
        }
      }
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(itunesQuery)}&country=TH&media=music&limit=${limit}`;
    const resp = await fetch(url, { next: { revalidate: 3600 } });
    if (!resp.ok) return [];
    const data = await resp.json();

    // If iTunes failed but we scraped the title, return a synthetic result
    if (!data.results || data.results.length === 0) {
      if (isScraped) {
        return [{
          id: `online-scraped`,
          title: fallbackTitle,
          artist: fallbackArtist,
          moodCategory: "เพลงไทย",
          moodTags: ["เพลงไทย", "ค้นหาออนไลน์"],
          lyricsSnippet: `(ค้นพบเนื้อเพลงที่คุณพิมพ์)`,
          fullChorus: `ระบบค้นพบว่าเนื้อเพลงที่คุณพิมพ์คือเพลง "${fallbackTitle}" ของ "${fallbackArtist}"`,
          gradient: "from-indigo-900 via-purple-900 to-slate-900",
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(fallbackTitle + " " + fallbackArtist)}`,
          spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(fallbackTitle + " " + fallbackArtist)}`,
          score: 0.95,
          matchType: "online",
          matchedPhrase: `ระบบอัจฉริยะค้นพบชื่อเพลง!`
        }];
      }
      return [];
    }

    return data.results.map((item: any, idx: number) => {
      const title = item.trackName || item.collectionName || fallbackTitle;
      const artist = item.artistName || fallbackArtist;
      const artwork = item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "600x600bb") : undefined;
      const preview = item.previewUrl;
      const genre = item.primaryGenreName || "เพลงไทย";

      const titleScore = Math.max(...Object.values(calculateDetailedMatchScore(query, title)).filter(v => typeof v === 'number'));
      const artistScore = Math.max(...Object.values(calculateDetailedMatchScore(query, artist)).filter(v => typeof v === 'number'));
      
      // If we scraped it successfully from lyrics, it's a 95% match!
      const bestScore = isScraped ? 0.95 : Math.max(titleScore, artistScore, 0.40);

      return {
        id: `online-${item.trackId || idx}`,
        title: title,
        artist: artist,
        moodCategory: genre,
        moodTags: [genre, "เพลงฮิต", "ค้นหาออนไลน์"],
        lyricsSnippet: isScraped ? `(ค้นพบเนื้อเพลงที่คุณพิมพ์)` : `เพลงฮิตของ ${artist} — "${title}"`,
        fullChorus: isScraped ? `ระบบค้นพบว่าเนื้อเพลงที่คุณพิมพ์คือเพลง "${title}"` : `ค้นพบจากฐานข้อมูลเพลงออนไลน์`,
        gradient: "from-indigo-900 via-purple-900 to-slate-900",
        artworkUrl: artwork,
        previewAudioUrl: preview,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " " + artist)}`,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(title + " " + artist)}`,
        score: Number(Math.min(0.99, bestScore).toFixed(4)),
        matchType: "online",
        matchedPhrase: isScraped ? `เจอแล้ว! ค้นพบจากเนื้อเพลง` : `ค้นพบเพลงออนไลน์: ${title}`
      };
    });
  } catch (err) {
    console.error("Online music search error:", err);
    return [];
  }
}

// Master Search: Local Curated + Online Universal Fallback
export async function searchSongsMaster(query: string, topN = 6): Promise<ThaiSong[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return CURATED_THAI_SONGS.slice(0, topN);

  const queryVec = getQueryVector(cleanQ);

  // 1. Check Curated Local Songs
  const scoredLocal = CURATED_THAI_SONGS.map(song => {
    let bestDetailed: DetailedScore = { textMatch: 0, phoneticMatch: 0, ngramMatch: 0, semanticMatch: 0, finalScore: 0 };
    let bestMatchedPhrase = song.lyricsSnippet;

    const targets = [song.title, song.artist, song.lyricsSnippet];
    if (song.fullChorus) targets.push(song.fullChorus);
    if (song.famousHooks) targets.push(...song.famousHooks);
    if (song.misheardVariants) targets.push(...song.misheardVariants);

    for (const t of targets) {
      const d = calculateDetailedMatchScore(cleanQ, t);
      // Use phonetic as base comparison for finding the best string target
      if (d.phoneticMatch > bestDetailed.phoneticMatch) {
        bestDetailed = d;
        bestMatchedPhrase = t;
      }
    }

    // Determine semantic score
    const isMoodSearch = cleanQ.length <= 15 && !cleanQ.includes(" ");
    const semanticSim = song.vector && isMoodSearch ? Math.max(0, cosineSimilarity(queryVec, song.vector)) : 0;
    bestDetailed.semanticMatch = semanticSim;

    // Apply weights to final score: 50% Text, 30% Phonetic, 15% N-gram, 5% Semantic
    bestDetailed.finalScore = (bestDetailed.textMatch * 0.50) +
                              (bestDetailed.phoneticMatch * 0.30) +
                              (bestDetailed.ngramMatch * 0.15) +
                              (bestDetailed.semanticMatch * 0.05);

    let matchType: "lyrics" | "semantic" | "title" = "lyrics";
    if (bestDetailed.semanticMatch > bestDetailed.textMatch && isMoodSearch) {
      matchType = "semantic";
    }

    // Title and Artist Exact Matches should still override to top score
    const isExactTitle = calculateDetailedMatchScore(cleanQ, song.title).textMatch > 0.8;
    const isExactArtist = calculateDetailedMatchScore(cleanQ, song.artist).textMatch > 0.8;
    if (isExactTitle || isExactArtist) {
      bestDetailed.finalScore = Math.max(bestDetailed.finalScore, 0.95);
      matchType = "title";
    }

    return {
      ...song,
      score: Number(Math.min(0.99, Math.max(0.01, bestDetailed.finalScore)).toFixed(4)),
      matchType,
      matchedPhrase: bestMatchedPhrase,
      detailedScore: bestDetailed
    };
  });

  // 2. Run online search unconditionally and merge results, picking highest scores
  const onlineSongs = await searchOnlineThaiSongs(cleanQ, topN);
  
  const combined = [...scoredLocal, ...onlineSongs];
  
  // Sort all results by actual score
  combined.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Remove duplicates by title
  const seen = new Set<string>();
  const unique: ThaiSong[] = [];
  for (const s of combined) {
    const key = normalizeThaiText(s.title);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
  }

  return unique.slice(0, topN);
}
