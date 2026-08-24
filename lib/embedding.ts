// lib/embedding.ts
// Thai Word Embedding Engine & Cosine Similarity Calculator

export interface SimilarWord {
  word: string;
  score: number;
  category?: string;
}

// Helper to compute cosine similarity between two unit vectors
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (!v1 || !v2 || v1.length !== v2.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Seed Cluster centers for Semantic Space (100 Dimensions)
// Grouped into emotion, mood, acoustic/vibe, actions, romance, heartbreak, party, chill
const DIM = 100;
function createSeedVector(seedIndex: number, noiseFactor = 0.05): number[] {
  const vec = new Array(DIM).fill(0);
  for (let i = 0; i < DIM; i++) {
    const angle = (seedIndex * 13.37 + i * 0.42);
    vec[i] = Math.sin(angle) + Math.cos(angle * 0.7) + (Math.random() - 0.5) * noiseFactor;
  }
  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0));
  return vec.map(v => v / norm);
}

// Anchor clusters
const CLUSTER_HEARTBREAK = createSeedVector(1); // อกหัก, เศร้า, เจ็บ, ร้องไห้, ลืม, คิดถึง
const CLUSTER_LOVE = createSeedVector(2);       // รัก, แอบชอบ, น่ารัก, คลั่งรัก, หวาน, เธอ
const CLUSTER_CHILL = createSeedVector(3);      // ชิล, ริมทะเล, กาแฟ, ลมหนาว, ผ่อนคลาย, ธรรมชาติ
const CLUSTER_ENERGY = createSeedVector(4);     // สนุก, เต้น, มันส์, ปาร์ตี้, สู้, กำลังใจ, ฝัน
const CLUSTER_LONELY = createSeedVector(5);     // เหงา, โดดเดี่ยว, กลางคืน, ฝนตก, คิดถึงแฟนเก่า
const CLUSTER_INDIE = createSeedVector(6);      // วินเทจ, อินดี้, อคูสติก, ค่ำคืน, พระอาทิตย์ตก
const CLUSTER_FOOD = createSeedVector(7);       // อร่อย, ส้มตำ, กาแฟ, แซ่บ, ขนม, หวาน, กิน

// Vocabulary Database
export const THAI_VOCAB_MAP: Record<string, { vector: number[]; category: string }> = {};

function addWord(word: string, baseCluster: number[], category: string, jitter = 0.1) {
  const vec = baseCluster.map(v => v + (Math.random() - 0.5) * jitter);
  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0));
  THAI_VOCAB_MAP[word] = {
    vector: vec.map(v => Number((v / norm).toFixed(4))),
    category
  };
}

// 1. Heartbreak & Sadness
const heartbreakWords = [
  "อกหัก", "เศร้า", "เจ็บ", "ร้องไห้", "น้ำตา", "เสียใจ", "ลืม", "เลิก", "แฟนเก่า",
  "ทิ้ง", "หลอก", "ผิดหวัง", "ทรมาน", "ใจพัง", "ไม่รัก", "ตัดใจ", "คืนวันศุกร์", "แผลใจ",
  "เส้า", "อักหัก", "ร้องไห้หนักมาก", "ดิ่ง"
];
heartbreakWords.forEach(w => addWord(w, CLUSTER_HEARTBREAK, "อกหัก / เสียใจ"));

// 2. Love & Romance
const loveWords = [
  "รัก", "ชอบ", "แอบชอบ", "คลั่งรัก", "น่ารัก", "หวาน", "แฟน", "คิดถึง", "ใจเต้น",
  "ตกหลุมรัก", "แต่งงาน", "คู่รัก", "คนโปรด", "แก้มหอม", "อบอุ่น", "รอยยิ้ม", "ใจฟู",
  "นุ้บนิ้บ", "รักเธอ", "คนดี", "หวานเจี๊ยบ"
];
loveWords.forEach(w => addWord(w, CLUSTER_LOVE, "ความรัก / โรแมนติก"));

// 3. Chill & Nature
const chillWords = [
  "ชิล", "สบาย", "ริมทะเล", "กาแฟ", "คาเฟ่", "ลมหนาว", "ดอย", "ธรรมชาติ", "พักผ่อน",
  "ผ่อนคลาย", "นั่งชิล", "วันหยุด", "สายลม", "ทะเลหมอก", "ชิว", "ชิลล์", "นั่งมองฟ้า",
  "ขับรถเล่น", "ฟังเพลงชิลๆ"
];
chillWords.forEach(w => addWord(w, CLUSTER_CHILL, "ชิลล์ / พักผ่อน"));

// 4. Energy & Party & Motivation
const energyWords = [
  "สนุก", "มันส์", "เต้น", "ปาร์ตี้", "สู้", "กำลังใจ", "ความหวัง", "ความฝัน", "แรงบันดาลใจ",
  "พลัง", "ปลุกใจ", "มัน", "โยก", "แดนซ์", "คอนเสิร์ต", "ฮึด", "ลุย", "ไม่ยอมแพ้", "ชัยชนะ"
];
energyWords.forEach(w => addWord(w, CLUSTER_ENERGY, "ปาร์ตี้ / กำลังใจ"));

// 5. Lonely & Night
const lonelyWords = [
  "เหงา", "โดดเดี่ยว", "กลางคืน", "ฝนตก", "เตียงนอน", "ความเงียบ", "ดึกดื่น", "นอนไม่หลับ",
  "คิดถึงใครบางคน", "อยู่คนเดียว", "หนาว", "ห้องว่าง", "หงอย", "เหงาจัง"
];
lonelyWords.forEach(w => addWord(w, CLUSTER_LONELY, "เหงา / กลางคืน"));

// 6. Indie & City Pop
const indieWords = [
  "อินดี้", "วินเทจ", "อคูสติก", "พระอาทิตย์ตก", "สายฝน", "กีตาร์", "ยุค90", "ซิตี้ป๊อป",
  "แจ๊ส", "บรรยากาศ", "ฟุ้ง", "ดนตรีสด", "คอร์ดกีตาร์"
];
indieWords.forEach(w => addWord(w, CLUSTER_INDIE, "อินดี้ / บรรยากาศ"));

// 7. Food & Lifestyle
const foodWords = [
  "อร่อย", "แซ่บ", "ส้มตำ", "ชาเขียว", "ของกิน", "อาหาร", "ขนมหวาน", "กลมกล่อม", "เข้มข้น",
  "ฟิน", "อร่ย", "อน่อย", "อาหย่อย", "บริการ", "ราคา", "แพง", "ถูก", "ร้านอาหาร"
];
foodWords.forEach(w => addWord(w, CLUSTER_FOOD, "อาหาร / ไลฟ์สไตล์"));

// Function to get vector of a query text
export function getQueryVector(text: string): number[] {
  const clean = text.trim().toLowerCase();
  if (THAI_VOCAB_MAP[clean]) {
    return THAI_VOCAB_MAP[clean].vector;
  }

  // If compound sentence, find sub-words matching vocab and average them
  const matchedVectors: number[][] = [];
  for (const [w, data] of Object.entries(THAI_VOCAB_MAP)) {
    if (clean.includes(w)) {
      matchedVectors.push(data.vector);
    }
  }

  if (matchedVectors.length > 0) {
    const avg = new Array(DIM).fill(0);
    for (const vec of matchedVectors) {
      for (let i = 0; i < DIM; i++) avg[i] += vec[i];
    }
    const norm = Math.sqrt(avg.reduce((acc, v) => acc + v * v, 0));
    return avg.map(v => (norm > 0 ? v / norm : 0));
  }

  // Fallback hash-based embedding for unseen words
  const hash = clean.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return createSeedVector(hash % 10 + 1);
}

// Function to find top N most similar words
export function findSimilarWords(query: string, topN = 10): SimilarWord[] {
  const targetVec = getQueryVector(query);
  const results: SimilarWord[] = [];

  for (const [word, data] of Object.entries(THAI_VOCAB_MAP)) {
    if (word.toLowerCase() === query.trim().toLowerCase()) continue;
    const sim = cosineSimilarity(targetVec, data.vector);
    results.push({
      word,
      score: Number(sim.toFixed(4)),
      category: data.category
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}
