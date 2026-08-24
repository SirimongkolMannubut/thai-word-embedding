// lib/fuzzy.ts
// Thai Fuzzy Matching & Phonetic String Distance for Misheard / Misspelled Lyrics

// Normalize Thai text: trim, lowercase, collapse repeat characters, remove common noise
export function normalizeThaiText(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/(.)\1{2,}/g, "$1$1") // collapse "มากกกกก" -> "มากก"
    .replace(/[,\.?!~\"\'`\-_\/]/g, "");
}

// Remove Thai tone marks and diacritics for ultra-fuzzy phonetic matching
export function removeThaiDiacritics(str: string): string {
  if (!str) return "";
  // Removes ่ ้ ๊ ๋ ็ ์ ๎ ํ ฺ ิ ี ึ ื ุ ู ฺ
  return str.replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, "");
}

// Bigram / N-gram Similarity (Dice Coefficient)
export function ngramSimilarity(str1: string, str2: string, n = 2): number {
  const s1 = normalizeThaiText(str1);
  const s2 = normalizeThaiText(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    if (minLen >= 4) {
      return Math.max(0.60, minLen / maxLen);
    }
  }

  if (s1.length < n || s2.length < n) {
    return s1 === s2 ? 1.0 : 0.0;
  }

  const getNGrams = (text: string) => {
    const ngrams = new Set<string>();
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.add(text.substring(i, i + n));
    }
    return ngrams;
  };

  const set1 = getNGrams(s1);
  const set2 = getNGrams(s2);

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) intersection++;
  }

  return (2 * intersection) / (set1.size + set2.size);
}

export interface DetailedScore {
  textMatch: number;
  phoneticMatch: number;
  ngramMatch: number;
  semanticMatch: number;
  finalScore: number;
}

// Sliding window best-match: finds the best sub-window in target that matches query
function slidingWindowMatch(query: string, target: string): number {
  if (!query || !target) return 0;
  if (target.includes(query)) return 0.95;
  
  const qLen = query.length;
  const tLen = target.length;
  
  if (qLen > tLen) {
    // Query longer than target: check if target is a substring of query
    if (query.includes(target)) return 0.75;
    return ngramSimilarity(query, target, 2);
  }
  
  let best = 0;
  const step = Math.max(1, Math.floor(qLen / 4));
  for (let i = 0; i <= tLen - qLen; i += step) {
    const slice = target.substring(i, i + qLen);
    const sim = ngramSimilarity(query, slice, 2);
    if (sim > best) best = sim;
    if (best >= 0.95) break;
  }
  // Also try windows slightly smaller/larger
  const qLen2 = Math.floor(qLen * 0.8);
  if (qLen2 >= 4) {
    for (let i = 0; i <= tLen - qLen2; i += step) {
      const slice = target.substring(i, i + qLen2);
      const sim = ngramSimilarity(query, slice, 2) * 0.85;
      if (sim > best) best = sim;
    }
  }
  return best;
}

// Advanced Phonetic & Tone-Insensitive Match Score
export function calculateDetailedMatchScore(query: string, targetText: string): DetailedScore {
  if (!query || !targetText) return { textMatch: 0, phoneticMatch: 0, ngramMatch: 0, semanticMatch: 0, finalScore: 0 };

  const qClean = normalizeThaiText(query);
  const tClean = normalizeThaiText(targetText);

  // 1. Text Match (Exact or Substring — very high confidence)
  let textMatch = 0;
  if (qClean === tClean) {
    textMatch = 1.0;
  } else if (tClean.includes(qClean) && qClean.length >= 4) {
    // Query is substring of target (e.g., lyrics snippet found in fullChorus)
    textMatch = Math.max(0.85, qClean.length / tClean.length);
  } else if (qClean.includes(tClean) && tClean.length >= 4) {
    textMatch = Math.max(0.75, tClean.length / qClean.length);
  }

  // 2. Phonetic Match (Tone-free & Diacritic-free ngram)
  const qPhone = removeThaiDiacritics(qClean);
  const tPhone = removeThaiDiacritics(tClean);
  let phoneticMatch = 0;
  if (qPhone === tPhone) {
    phoneticMatch = 1.0;
  } else if (tPhone.includes(qPhone) && qPhone.length >= 4) {
    phoneticMatch = 0.90;
  } else {
    phoneticMatch = Math.max(
      ngramSimilarity(qPhone, tPhone, 2),
      slidingWindowMatch(qPhone, tPhone)
    );
  }

  // 3. N-gram Match with Sliding Window
  const rawSim = ngramSimilarity(qClean, tClean, 2);
  const slideScore = slidingWindowMatch(qClean, tClean);
  const ngramMatch = Math.max(rawSim, slideScore);

  return {
    textMatch,
    phoneticMatch,
    ngramMatch,
    semanticMatch: 0, // Computed later via Embedding
    finalScore: 0     // Computed later
  };
}

export function calculateLyricsMatchScore(query: string, targetText: string): number {
  const d = calculateDetailedMatchScore(query, targetText);
  return Math.max(d.textMatch, d.phoneticMatch, d.ngramMatch);
}

