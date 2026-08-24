"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Search,
  Music,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  ChevronRight,
  Wand2,
  ListMusic,
} from "lucide-react";
import { findSimilarWords, SimilarWord } from "@/lib/embedding";
import { ThaiSong } from "@/lib/songs";

const SAMPLE_QUERIES = [
  { emoji: "👑", label: "เมียน้อย", value: "อยากมีเวลาไปหาเมียน้อย" },
  { emoji: "💔", label: "อย่าร้องห้าย", value: "ที่เธอเคยบอกฉัน อย่าร้องห้าย" },
  { emoji: "🎸", label: "ทรงอย่างแบด", value: "ทรงยังแบด แซดอย่างบ่อย" },
  { emoji: "☕", label: "โต๊ะริม", value: "โตะริมติดน่าต่าง สบตาแป๊บเดียว" },
  { emoji: "🌾", label: "บางปะกง", value: "ห่อหมกเอาไปฝากป้า" },
  { emoji: "🌿", label: "ทบ.2", value: "ต้องจากบ้านนา ถูกเกณเข้ามา" },
  { emoji: "🎤", label: "ทนได้ทุกที", value: "ทนได้ทุกทีที่เธอทำช้ำใจ" },
  { emoji: "💬", label: "แค่คนคุย", value: "ฉันมันแค่คนคุย ไม่ใช่คนรัก" },
];

const scoreColor = (v: number) =>
  v >= 0.8 ? "text-emerald-400" : v >= 0.5 ? "text-yellow-400" : "text-slate-400";
const scoreBarColor = (v: number) =>
  v >= 0.8 ? "bg-emerald-500" : v >= 0.5 ? "bg-yellow-400" : "bg-slate-500";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [similarWords, setSimilarWords] = useState<SimilarWord[]>([]);
  const [matchedSongs, setMatchedSongs] = useState<ThaiSong[]>([]);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"songs" | "words">("songs");
  const [expandedSong, setExpandedSong] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeechSupported(false); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "th-TH";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setQuery(t);
      setIsListening(false);
      doSearch(t);
    };
    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed") alert("กรุณาอนุญาตการใช้งานไมโครโฟน");
      setIsListening(false);
    };
    recognitionRef.current = rec;
  }, []);

  const doSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setHasSearched(true);
    setSimilarWords(findSimilarWords(trimmed, 8));
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setMatchedSongs(data.matchedSongs || []);
      }
    } catch { }
    finally { setIsLoading(false); }
  };

  const toggleMic = () => {
    if (!speechSupported) { alert("Chrome เท่านั้นที่รองรับ Voice Search"); return; }
    if (isListening) { recognitionRef.current?.stop(); }
    else {
      try { recognitionRef.current?.start(); }
      catch (e: any) {
        if (e?.name === "InvalidStateError") {
          recognitionRef.current?.stop();
          setTimeout(() => recognitionRef.current?.start(), 200);
        }
      }
    }
  };

  const toggleAudio = (id: string, url?: string) => {
    if (!url) return;
    if (playingSongId === id) {
      audioRef.current?.pause();
      setPlayingSongId(null);
    } else {
      audioRef.current?.pause();
      const a = new Audio(url);
      a.onended = () => setPlayingSongId(null);
      a.play();
      audioRef.current = a;
      setPlayingSongId(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#080811] text-white flex flex-col w-full relative overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-1/3 right-[-60px] w-48 h-48 rounded-full bg-pink-600/12 blur-3xl" />
        <div className="absolute bottom-1/4 left-[-40px] w-40 h-40 rounded-full bg-indigo-600/12 blur-3xl" />
      </div>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-[#080811]/85 backdrop-blur-2xl border-b border-white/5 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-4">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
            <Music size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[clamp(1rem,3vw,1.25rem)] font-bold text-white leading-tight">Thai Song Finder</h1>
            <p className="text-[clamp(0.65rem,2vw,0.85rem)] text-slate-500">ค้นหาจากเนื้อเพลง • พูดก็ได้</p>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full">
          <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 border transition-all ${
            isListening
              ? "bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/15"
              : "bg-white/[0.05] border-white/10 focus-within:border-violet-500/50 focus-within:bg-violet-900/10"
          }`}>
            <Search size={15} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={isListening ? "🎙️  กำลังฟังเสียง..." : query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="พิมพ์ท่อนเพลงที่จำได้..."
              readOnly={isListening}
              className="flex-1 bg-transparent text-[clamp(1rem,2vw,1.125rem)] text-white placeholder-slate-600 outline-none w-full"
            />
            <button
              type="button"
              onClick={toggleMic}
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                isListening ? "bg-rose-500 animate-pulse" : "bg-white/8 hover:bg-violet-500/30"
              }`}
            >
              {isListening ? <MicOff size={14} className="text-white" /> : <Mic size={14} className="text-violet-300" />}
            </button>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 active:scale-90 disabled:opacity-30 shadow-md shadow-violet-500/30"
            >
              {isLoading
                ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ChevronRight size={14} className="text-white" />
              }
            </button>
          </div>
        </form>

        {/* Quick Pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mt-4 pb-1">
          {SAMPLE_QUERIES.map((p) => (
            <button
              key={p.value}
              onClick={() => { setQuery(p.value); doSearch(p.value); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.05] border border-white/8 text-[clamp(0.7rem,1.5vw,0.85rem)] text-slate-400 whitespace-nowrap hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-white active:scale-95 transition-all flex-shrink-0"
            >
              <span className="text-base leading-none">{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-28 md:pb-12 relative z-10">
        <div className="max-w-6xl mx-auto w-full">

        {/* EMPTY STATE */}
        {!hasSearched && (
          <div className="flex flex-col items-center text-center py-12 gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/8 flex items-center justify-center">
              <Wand2 size={28} className="text-violet-400" />
            </div>
            <div>
              <p className="text-[clamp(1rem,3vw,1.25rem)] font-bold text-white">ค้นหาเพลงด้วยเนื้อเพลง</p>
              <p className="text-slate-400 text-[clamp(0.75rem,2vw,0.875rem)] mt-1.5 leading-relaxed max-w-[85%] sm:max-w-sm mx-auto">
                พิมพ์ท่อนที่จำได้ หรือกดไมค์ร้องเพลง<br />
                แม้จำผิดหรือสะกดผิด ก็หาเจอ!
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl mt-4">
              {SAMPLE_QUERIES.slice(0, 4).map((q) => (
                <button
                  key={q.value}
                  onClick={() => { setQuery(q.value); doSearch(q.value); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/8 hover:bg-violet-500/10 hover:border-violet-500/30 active:scale-97 transition-all text-left"
                >
                  <span className="text-xl">{q.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[clamp(0.875rem,2vw,1rem)] font-semibold text-white">{q.label}</p>
                    <p className="text-[clamp(0.65rem,1.5vw,0.8rem)] text-slate-500 truncate">{q.value}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {hasSearched && (
          <div className="space-y-3">
            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/8">
              {(["songs", "words"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[clamp(0.75rem,2vw,0.875rem)] font-semibold transition-all ${
                    activeView === tab
                      ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab === "songs" ? <><ListMusic size={13} /> เพลง {matchedSongs.length > 0 && `(${matchedSongs.length})`}</> : <><Sparkles size={13} /> คำใกล้เคียง</>}
                </button>
              ))}
            </div>

            {/* Loading Skeletons */}
            {isLoading && activeView === "songs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/5 p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl bg-white/8 flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3.5 bg-white/8 rounded-full w-3/4" />
                        <div className="h-3 bg-white/5 rounded-full w-1/2" />
                        <div className="h-2.5 bg-white/4 rounded-full w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SONG CARDS */}
            {activeView === "songs" && !isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-6">
                {matchedSongs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-slate-400 text-sm">ไม่พบเพลงที่ตรงกัน</p>
                    <p className="text-slate-600 text-xs mt-1">ลองพิมพ์เนื้อเพลงอื่น หรือกดไมค์ร้องเพลง</p>
                  </div>
                ) : (
                  matchedSongs.map((song, idx) => {
                    const score = song.score || 0;
                    const isTop = idx === 0;
                    const isExpanded = expandedSong === song.id;
                    const isPlaying = playingSongId === song.id;

                    return (
                      <div key={song.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                        isTop
                          ? "bg-gradient-to-br from-violet-900/40 via-purple-900/25 to-transparent border-violet-500/35 shadow-lg shadow-violet-500/10"
                          : "bg-white/[0.025] border-white/8"
                      }`}>
                        {/* Top Banner */}
                        {isTop && (
                          <div className="px-4 py-1.5 bg-gradient-to-r from-violet-500/15 to-pink-500/10 border-b border-violet-500/15 flex items-center gap-1.5">
                            <Sparkles size={11} className="text-violet-400" />
                            <span className="text-[10px] font-semibold text-violet-300 tracking-wide">อันดับ 1 — ตรงที่สุด</span>
                          </div>
                        )}

                        <div className="p-3.5">
                          <div className="flex items-start gap-3">
                            {/* Artwork */}
                            <div className="relative flex-shrink-0">
                              {song.artworkUrl ? (
                                <img src={song.artworkUrl} alt={song.title} className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                              ) : (
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${song.gradient}`}>
                                  <Music size={20} className="text-white/70" />
                                </div>
                              )}
                              {!isTop && (
                                <div className="absolute -top-1 -left-1 w-4.5 h-4.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                  <span className="text-[clamp(0.55rem,1.2vw,0.7rem)] font-bold text-slate-400">{idx + 1}</span>
                                </div>
                              )}
                            </div>

                            {/* Title/Artist */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <h3 className="font-bold text-sm text-white leading-tight line-clamp-1">{song.title}</h3>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{song.artist}</p>
                              <span className="inline-block mt-1.5 text-[9px] px-2 py-0.5 rounded-full bg-white/6 text-slate-400 border border-white/6">
                                {song.moodCategory}
                              </span>
                            </div>

                            {/* Score */}
                            <div className="flex-shrink-0 text-right pl-1">
                              <div className={`text-xl font-black leading-none ${scoreColor(score)}`}>
                                {Math.round(score * 100)}
                              </div>
                              <div className="text-[9px] text-slate-600">%</div>
                            </div>
                          </div>

                          {/* Score Bars */}
                          {song.detailedScore && (
                            <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1.5">
                              {[
                                { label: "เนื้อร้อง", val: song.detailedScore.textMatch },
                                { label: "เสียง", val: song.detailedScore.phoneticMatch },
                                { label: "ความหมาย", val: song.detailedScore.semanticMatch },
                              ].map(({ label, val }) => (
                                <div key={label}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-[9px] text-slate-600">{label}</span>
                                    <span className="text-[9px] font-mono text-slate-500">{Math.round(val * 100)}%</span>
                                  </div>
                                  <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                                    <div className={`h-full rounded-full ${scoreBarColor(val)} transition-all duration-700`} style={{ width: `${Math.round(val * 100)}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Matched Phrase */}
                          {song.matchedPhrase && song.matchedPhrase.length > 4 && (
                            <div className="mt-2.5 px-3 py-2 rounded-xl bg-black/25 border border-white/5">
                              <p className="text-[11px] text-slate-400 italic line-clamp-2">"{song.matchedPhrase}"</p>
                            </div>
                          )}

                          {/* Top result — always show links */}
                          {isTop && (
                            <div className="flex gap-2 mt-3">
                              <a href={song.youtubeUrl} target="_blank" rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-600/12 border border-red-500/20 text-red-400 text-[clamp(0.7rem,2vw,0.9rem)] font-medium hover:bg-red-600/20 active:scale-95 transition-all">
                                <ExternalLink size={11} /> YouTube
                              </a>
                              <a href={song.spotifyUrl} target="_blank" rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-600/12 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium hover:bg-emerald-600/20 active:scale-95 transition-all">
                                <ExternalLink size={11} /> Spotify
                              </a>
                            </div>
                          )}

                          {/* Toggle expand (other songs) */}
                          {!isTop && (
                            <button
                              onClick={() => setExpandedSong(isExpanded ? null : song.id)}
                              className="mt-2.5 w-full text-[10px] text-slate-600 hover:text-slate-400 transition-colors text-center"
                            >
                              {isExpanded ? "ย่อลง ▲" : "ดูลิงก์ ▼"}
                            </button>
                          )}

                          {/* Expanded: links + audio */}
                          {!isTop && isExpanded && (
                            <div className="mt-2 space-y-2">
                              {song.previewAudioUrl && (
                                <button
                                  onClick={() => toggleAudio(song.id, song.previewAudioUrl)}
                                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
                                    isPlaying
                                      ? "bg-violet-600/30 text-violet-300 border border-violet-500/30 animate-pulse"
                                      : "bg-white/6 text-slate-400 border border-white/8 hover:text-white"
                                  }`}
                                >
                                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                                  {isPlaying ? "กำลังเล่น..." : "🎧 ฟังตัวอย่าง 30 วิ"}
                                </button>
                              )}
                              <div className="flex gap-2">
                                <a href={song.youtubeUrl} target="_blank" rel="noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-600/12 border border-red-500/20 text-red-400 text-[11px] font-medium hover:bg-red-600/20 active:scale-95 transition-all">
                                  <ExternalLink size={11} /> YouTube
                                </a>
                                <a href={song.spotifyUrl} target="_blank" rel="noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-600/12 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium hover:bg-emerald-600/20 active:scale-95 transition-all">
                                  <ExternalLink size={11} /> Spotify
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* WORD RESULTS */}
            {activeView === "words" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-6">
                <p className="text-[clamp(0.65rem,1.5vw,0.85rem)] text-slate-600 px-1 pb-1">คำที่มีความหมายใกล้เคียงกัน (Word Embedding)</p>
                {similarWords.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-2">🔤</p>
                    <p className="text-slate-500 text-sm">ไม่พบคำใกล้เคียง</p>
                  </div>
                ) : (
                  similarWords.map((item, i) => (
                    <button
                      key={item.word}
                      onClick={() => { setQuery(item.word); doSearch(item.word); setActiveView("songs"); }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-violet-500/30 hover:bg-violet-500/5 active:scale-98 transition-all text-left"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-slate-500">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white">{item.word}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.category || "ความหมายใกล้เคียง"}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${Math.round(item.score * 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-violet-400 w-7 text-right">{Math.round(item.score * 100)}%</span>
                        <ChevronRight size={11} className="text-slate-700" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 md:hidden border-t border-white/5 bg-[#080811]/90 backdrop-blur-2xl px-8 py-3 safe-area-bottom">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveView("songs")}
            className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-all ${
              activeView === "songs" && hasSearched ? "text-violet-400" : "text-slate-600 hover:text-slate-400"
            }`}
          >
            <ListMusic size={20} />
            <span className="text-[9px] font-medium">เพลง</span>
          </button>

          {/* Centre Mic */}
          <button
            onClick={toggleMic}
            className={`relative w-14 h-14 rounded-[20px] flex items-center justify-center transition-all active:scale-90 shadow-xl ${
              isListening
                ? "bg-rose-500 shadow-rose-500/50"
                : "bg-gradient-to-br from-violet-500 to-pink-600 shadow-violet-500/40"
            }`}
          >
            {isListening && (
              <div className="absolute inset-0 rounded-[20px] border-2 border-rose-400/60 animate-ping" />
            )}
            {isListening ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
          </button>

          <button
            onClick={() => setActiveView("words")}
            className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-all ${
              activeView === "words" && hasSearched ? "text-violet-400" : "text-slate-600 hover:text-slate-400"
            }`}
          >
            <Sparkles size={20} />
            <span className="text-[9px] font-medium">คำใกล้เคียง</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

