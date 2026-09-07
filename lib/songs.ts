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
  albumArt?: string;
  artworkUrl?: string;
  previewUrl?: string;
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5b/46/8b/5b468bad-9bdf-0366-f4b7-df4abb459715/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5b/46/8b/5b468bad-9bdf-0366-f4b7-df4abb459715/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/26/1a/a6/261aa6cb-7a87-e854-0ef3-64ee2d6761dd/mzaf_11892575239634674633.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/26/1a/a6/261aa6cb-7a87-e854-0ef3-64ee2d6761dd/mzaf_11892575239634674633.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/84/6e/7f/846e7f27-2767-a158-891f-7201775df6bf/3610159861499.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/84/6e/7f/846e7f27-2767-a158-891f-7201775df6bf/3610159861499.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/7f/b5/447fb5b3-f2ed-9e05-866b-552666200d89/mzaf_5074810786245243871.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/7f/b5/447fb5b3-f2ed-9e05-866b-552666200d89/mzaf_5074810786245243871.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/1a/33/a5/1a33a51e-0429-f8fb-b708-22d46e9c90ae/888332972352.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/1a/33/a5/1a33a51e-0429-f8fb-b708-22d46e9c90ae/888332972352.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ee/af/a2/eeafa236-6203-1663-d6c0-7a27f0b2133b/mzaf_932770962758419181.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ee/af/a2/eeafa236-6203-1663-d6c0-7a27f0b2133b/mzaf_932770962758419181.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d6/4c/04/d64c04fb-0f71-fd85-298e-1961a9ce0fc0/888332970990.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d6/4c/04/d64c04fb-0f71-fd85-298e-1961a9ce0fc0/888332970990.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2b/b0/71/2bb071d8-90fd-2e0e-c800-330ae195bdc7/mzaf_90161783648859862.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2b/b0/71/2bb071d8-90fd-2e0e-c800-330ae195bdc7/mzaf_90161783648859862.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/93/e4/65/93e465b7-7474-d3ba-8bf8-a35c0303040a/888332978637.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/93/e4/65/93e465b7-7474-d3ba-8bf8-a35c0303040a/888332978637.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/34/ca/eb/34caeb87-f2b0-5ee6-1dd2-c7ea4a2c158d/mzaf_12142009513708047749.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/34/ca/eb/34caeb87-f2b0-5ee6-1dd2-c7ea4a2c158d/mzaf_12142009513708047749.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music5/v4/3d/fe/cb/3dfecb99-bb93-eecb-5675-89932e223337/test.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music5/v4/3d/fe/cb/3dfecb99-bb93-eecb-5675-89932e223337/test.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/24/4c/67/244c6721-9863-a216-ebf5-db24f1137196/mzaf_8486815487908379598.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/24/4c/67/244c6721-9863-a216-ebf5-db24f1137196/mzaf_8486815487908379598.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/53/03/81/530381c9-b271-3963-335a-2cbead8b7b79/888332137959.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/53/03/81/530381c9-b271-3963-335a-2cbead8b7b79/888332137959.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1b/98/bb/1b98bb25-aa28-68ed-68e3-22fb171d224f/mzaf_18370179776944489763.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1b/98/bb/1b98bb25-aa28-68ed-68e3-22fb171d224f/mzaf_18370179776944489763.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7c/8a/31/7c8a31a7-e16e-6714-23b7-18bc328e4554/888332972390.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7c/8a/31/7c8a31a7-e16e-6714-23b7-18bc328e4554/888332972390.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fc/38/1e/fc381e93-8e60-fd3d-e780-70c2aa8bd567/mzaf_3571313934466168581.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fc/38/1e/fc381e93-8e60-fd3d-e780-70c2aa8bd567/mzaf_3571313934466168581.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e4/52/8c/e4528cba-cb0e-31f9-b476-fe1b91bc22e0/888332946902.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e4/52/8c/e4528cba-cb0e-31f9-b476-fe1b91bc22e0/888332946902.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7f/5c/ae/7f5cae99-ac06-b69a-6ee5-38c0884ae4d7/mzaf_1260086953031912456.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7f/5c/ae/7f5cae99-ac06-b69a-6ee5-38c0884ae4d7/mzaf_1260086953031912456.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/0f/0f/42/0f0f4249-8f24-a6e8-56e4-6ec088900d93/25UMGIM79865.rgb.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/0f/0f/42/0f0f4249-8f24-a6e8-56e4-6ec088900d93/25UMGIM79865.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/14/66/49/1466491a-b745-525c-7b96-321b4fd231d0/mzaf_16914207157708959097.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/14/66/49/1466491a-b745-525c-7b96-321b4fd231d0/mzaf_16914207157708959097.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/9f/64/86/9f6486f1-746c-d3b5-1569-3a6294cdfea0/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/9f/64/86/9f6486f1-746c-d3b5-1569-3a6294cdfea0/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview123/v4/ca/32/cb/ca32cbd3-6e00-5d33-72c4-7d71ee456d73/mzaf_15308886385266869376.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview123/v4/ca/32/cb/ca32cbd3-6e00-5d33-72c4-7d71ee456d73/mzaf_15308886385266869376.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/61/00/f3/6100f3a3-619f-69fd-658b-560b78b15a29/888332907217.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/61/00/f3/6100f3a3-619f-69fd-658b-560b78b15a29/888332907217.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8c/90/a0/8c90a081-b8f8-8d89-acf7-3531400bd49d/mzaf_1875861912879165721.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8c/90/a0/8c90a081-b8f8-8d89-acf7-3531400bd49d/mzaf_1875861912879165721.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5d/70/fe/5d70fe6e-f3e4-c874-a2de-e4ecd186bf80/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5d/70/fe/5d70fe6e-f3e4-c874-a2de-e4ecd186bf80/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f4/5f/f4/f45ff486-6fa0-9df5-9d58-8ed552c86140/mzaf_5412811150878921175.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f4/5f/f4/f45ff486-6fa0-9df5-9d58-8ed552c86140/mzaf_5412811150878921175.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/03/05/78/0305781f-f8ef-04a9-8eb6-3b9de0574051/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/03/05/78/0305781f-f8ef-04a9-8eb6-3b9de0574051/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f7/45/b6/f745b644-d98a-e02d-bf0b-525d4f3d7589/mzaf_13381419881567407789.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f7/45/b6/f745b644-d98a-e02d-bf0b-525d4f3d7589/mzaf_13381419881567407789.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/67/40/40/67404052-23d4-b18a-2b6a-215fdaac94b6/888332908993.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/67/40/40/67404052-23d4-b18a-2b6a-215fdaac94b6/888332908993.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/60/cc/96/60cc96ee-d36d-201c-0ae7-a8f9d43d672e/mzaf_17220888096056606772.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/60/cc/96/60cc96ee-d36d-201c-0ae7-a8f9d43d672e/mzaf_17220888096056606772.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5d/c7/c4/5dc7c42d-fb41-bed7-e3b2-92352ce8e752/888332903004.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/5d/c7/c4/5dc7c42d-fb41-bed7-e3b2-92352ce8e752/888332903004.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f0/7a/7d/f07a7dfc-69f5-3fee-3e89-2defb4f4c2e9/mzaf_18323568041534034953.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f0/7a/7d/f07a7dfc-69f5-3fee-3e89-2defb4f4c2e9/mzaf_18323568041534034953.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/33/a9/b0/33a9b043-63ea-6114-ab6e-5de2027cb27a/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/33/a9/b0/33a9b043-63ea-6114-ab6e-5de2027cb27a/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/9e/3a/7d/9e3a7d09-003c-f3b5-49b6-c2a627a2b373/mzaf_17146489932272145354.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/9e/3a/7d/9e3a7d09-003c-f3b5-49b6-c2a627a2b373/mzaf_17146489932272145354.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/02/b8/2d/02b82dfb-e68f-f570-c3ed-5c1dd8a986a0/888332978453.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/02/b8/2d/02b82dfb-e68f-f570-c3ed-5c1dd8a986a0/888332978453.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/bf/52/85/bf5285f3-f900-4ba5-d15c-9fb718f9c9a1/mzaf_7410085405033923403.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/bf/52/85/bf5285f3-f900-4ba5-d15c-9fb718f9c9a1/mzaf_7410085405033923403.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/ff/b3/4f/ffb34fcf-bbf5-535e-530e-535dde6e5164/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/ff/b3/4f/ffb34fcf-bbf5-535e-530e-535dde6e5164/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/42/9b/c2/429bc2a9-7048-5d1a-f9a0-959ec95d59b8/mzaf_2127674775806246231.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/42/9b/c2/429bc2a9-7048-5d1a-f9a0-959ec95d59b8/mzaf_2127674775806246231.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music7/v4/1b/1c/96/1b1c960e-0862-95f5-3172-ba689bc95594/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music7/v4/1b/1c/96/1b1c960e-0862-95f5-3172-ba689bc95594/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/d6/0a/6b/d60a6b54-ec31-18bd-3d09-c3d0e58a15b8/mzaf_5031067836471649061.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/d6/0a/6b/d60a6b54-ec31-18bd-3d09-c3d0e58a15b8/mzaf_5031067836471649061.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e5/d5/1d/e5d51db9-6b50-89f1-65d9-35b436440439/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e5/d5/1d/e5d51db9-6b50-89f1-65d9-35b436440439/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e0/c2/a3/e0c2a3bb-aef0-43bd-922d-cbc01fa0d3b2/mzaf_6637886844505349168.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e0/c2/a3/e0c2a3bb-aef0-43bd-922d-cbc01fa0d3b2/mzaf_6637886844505349168.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e8/4b/b0/e84bb0bc-df2b-3e58-cd12-79e9e90ec6eb/888332927727.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e8/4b/b0/e84bb0bc-df2b-3e58-cd12-79e9e90ec6eb/888332927727.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f5/09/1c/f5091c22-938d-91ff-18c3-caa1b7ac9f3e/mzaf_9224781468942802203.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f5/09/1c/f5091c22-938d-91ff-18c3-caa1b7ac9f3e/mzaf_9224781468942802203.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7a/44/01/7a4401cd-6f86-9769-f56d-1e011f3747ed/888332926591.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7a/44/01/7a4401cd-6f86-9769-f56d-1e011f3747ed/888332926591.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/00/d6/6a/00d66ada-8c84-fa38-690d-06c4f117db14/mzaf_13517933317183766982.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/00/d6/6a/00d66ada-8c84-fa38-690d-06c4f117db14/mzaf_13517933317183766982.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/fb/ab/7a/fbab7ae3-9525-8d85-d337-01edb76fdab0/888332900805.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/fb/ab/7a/fbab7ae3-9525-8d85-d337-01edb76fdab0/888332900805.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a9/e0/eb/a9e0eb67-4178-6582-5697-83592742bf37/mzaf_11909962344803278846.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a9/e0/eb/a9e0eb67-4178-6582-5697-83592742bf37/mzaf_11909962344803278846.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ad/a7/ad/ada7adf6-8b79-647b-ec09-b011674dcc65/888332978811.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ad/a7/ad/ada7adf6-8b79-647b-ec09-b011674dcc65/888332978811.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7a/73/6f/7a736ff6-928f-8aa5-00e7-e19972bfb316/mzaf_2211032680049466441.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7a/73/6f/7a736ff6-928f-8aa5-00e7-e19972bfb316/mzaf_2211032680049466441.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ae/96/c1/ae96c1b8-5604-c550-47ba-d00eb27f5707/888332979047.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ae/96/c1/ae96c1b8-5604-c550-47ba-d00eb27f5707/888332979047.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/9b/b7/119bb7bb-4063-d44f-8b55-aabccacf2ffc/mzaf_10768527079650164179.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/9b/b7/119bb7bb-4063-d44f-8b55-aabccacf2ffc/mzaf_10768527079650164179.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f9/3e/2a/f93e2a34-8b30-c807-c811-b5d12186621e/888332983310.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f9/3e/2a/f93e2a34-8b30-c807-c811-b5d12186621e/888332983310.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/3b/d5/7b/3bd57b69-4af2-6723-8a32-b0817767626a/mzaf_7623145538975859349.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/3b/d5/7b/3bd57b69-4af2-6723-8a32-b0817767626a/mzaf_7623145538975859349.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b3/10/f7/b310f75e-2465-705c-7d55-0480dcce3b98/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b3/10/f7/b310f75e-2465-705c-7d55-0480dcce3b98/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ab/16/c1/ab16c133-7bdc-01e6-0e6c-f9ff0c8c9f41/mzaf_3282050872927801930.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ab/16/c1/ab16c133-7bdc-01e6-0e6c-f9ff0c8c9f41/mzaf_3282050872927801930.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/9d/c0/62/9dc06209-2aa1-9f7b-af29-b2fb4477c230/888332987714.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/9d/c0/62/9dc06209-2aa1-9f7b-af29-b2fb4477c230/888332987714.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ba/99/95/ba9995ab-cd24-0747-6df8-887660bbe33a/mzaf_16318355058843765010.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ba/99/95/ba9995ab-cd24-0747-6df8-887660bbe33a/mzaf_16318355058843765010.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/c0/0d/a4c00d21-74fd-6fc0-f983-ca4a18b41ea0/190296652783.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/c0/0d/a4c00d21-74fd-6fc0-f983-ca4a18b41ea0/190296652783.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/55/0a/cf/550acf20-04fa-8f88-77b8-36a30260b239/mzaf_809632077336477318.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/55/0a/cf/550acf20-04fa-8f88-77b8-36a30260b239/mzaf_809632077336477318.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/f8/b8/b1/f8b8b1ac-fdd6-e747-84e5-f5f95ff4de55/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/f8/b8/b1/f8b8b1ac-fdd6-e747-84e5-f5f95ff4de55/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/31/24/96/31249658-68dd-9a37-ec59-0f4890544879/mzaf_15561524050237025967.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/31/24/96/31249658-68dd-9a37-ec59-0f4890544879/mzaf_15561524050237025967.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d0/39/b8/d039b825-8cde-4362-2400-4c612097dd46/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d0/39/b8/d039b825-8cde-4362-2400-4c612097dd46/cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/21/f0/fd/21f0fd22-99d6-addf-ac2b-5388a36a18cd/mzaf_17448532609009968986.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/21/f0/fd/21f0fd22-99d6-addf-ac2b-5388a36a18cd/mzaf_17448532609009968986.plus.aac.p.m4a",
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
    albumArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f9/7c/3d/f97c3da2-f640-23a3-e6d7-9a649b9b9847/23UM1IM50440.rgb.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f9/7c/3d/f97c3da2-f640-23a3-e6d7-9a649b9b9847/23UM1IM50440.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/85/bc/d5/85bcd57c-bd2b-286d-19c6-d4ccdb6cb107/mzaf_12758905673210241851.plus.aac.p.m4a",
    previewAudioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/85/bc/d5/85bcd57c-bd2b-286d-19c6-d4ccdb6cb107/mzaf_12758905673210241851.plus.aac.p.m4a",
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
          const m1 = snip.match(/เนื้อเพลง:?\s*([^\s][^ศ]+?)\s*ศิลปิน:?\s*([^\s][^อ]+?)(?:\s*อัลบั้ม|\s*$|\.\.\.)/);
          if (m1) { found = { t: m1[1].trim(), a: m1[2].trim() }; break; }
          
          const m2 = snip.match(/เนื้อเพลง\s+([^-]+)\s*-\s*([^-\n]+)/);
          if (m2 && !m2[1].includes("ถูกต้อง") && !m2[1].includes("ที่แสดงบนเว็บ")) { 
            found = { t: m2[1].trim(), a: m2[2].split(" ")[0].trim() }; 
            break; 
          }
        }

        if (!found) {
          for (const snip of snips) {
            const m3 = snip.match(/คอร์ดเพลง\s+([^\s]+)\s+จากศิลปิน\s+([^\s]+)/);
            if (m3) { found = { t: m3[1].trim(), a: m3[2].trim() }; break; }
            const m4 = snip.match(/เนื้อเพลง\s+([^\s]+)\s+ที่แสดงบนเว็บ/);
            if (m4) { found = { t: m4[1].trim(), a: "" }; break; }
          }
        }

        if (found) {
          if (found.a && found.a.length > 30) found.a = found.a.split(" ")[0];
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
        albumArt: artwork,
        artworkUrl: artwork,
        previewUrl: preview,
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
      if (d.phoneticMatch > bestDetailed.phoneticMatch) {
        bestDetailed = d;
        bestMatchedPhrase = t;
      }
    }

    const isMoodSearch = cleanQ.length <= 15 && !cleanQ.includes(" ");
    const semanticSim = song.vector && isMoodSearch ? Math.max(0, cosineSimilarity(queryVec, song.vector)) : 0;
    bestDetailed.semanticMatch = semanticSim;

    bestDetailed.finalScore = (bestDetailed.textMatch * 0.50) +
                              (bestDetailed.phoneticMatch * 0.30) +
                              (bestDetailed.ngramMatch * 0.15) +
                              (bestDetailed.semanticMatch * 0.05);

    let matchType: "lyrics" | "semantic" | "title" = "lyrics";
    if (bestDetailed.semanticMatch > bestDetailed.textMatch && isMoodSearch) {
      matchType = "semantic";
    }

    const isExactTitle = calculateDetailedMatchScore(cleanQ, song.title).textMatch > 0.8;
    const isExactArtist = calculateDetailedMatchScore(cleanQ, song.artist).textMatch > 0.8;
    if (isExactTitle || isExactArtist) {
      bestDetailed.finalScore = Math.max(bestDetailed.finalScore, 0.95);
      matchType = "title";
    }

    return {
      ...song,
      albumArt: song.albumArt || song.artworkUrl,
      artworkUrl: song.artworkUrl || song.albumArt,
      previewUrl: song.previewUrl || song.previewAudioUrl,
      previewAudioUrl: song.previewAudioUrl || song.previewUrl,
      score: Number(Math.min(0.99, Math.max(0.01, bestDetailed.finalScore)).toFixed(4)),
      matchType,
      matchedPhrase: bestMatchedPhrase,
      detailedScore: bestDetailed
    };
  });

  // 2. Run online search unconditionally and merge results, picking highest scores
  const onlineSongs = await searchOnlineThaiSongs(cleanQ, topN);
  
  const combined = [...scoredLocal, ...onlineSongs];
  combined.sort((a, b) => (b.score || 0) - (a.score || 0));

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
