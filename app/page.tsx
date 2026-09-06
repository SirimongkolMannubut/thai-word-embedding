"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Search, Music, Sparkles, ExternalLink,
  Play, Pause, ChevronRight, Wand2, ListMusic, Zap, Globe,
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
  v >= 0.8 ? "text-emerald-400" : v >= 0.5 ? "text-amber-400" : "text-slate-400";
const scoreBarColor = (v: number) =>
  v >= 0.8 ? "bg-emerald-500" : v >= 0.5 ? "bg-amber-400" : "bg-slate-600";

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
      setQuery(t); setIsListening(false); doSearch(t);
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
    setIsLoading(true); setHasSearched(true);
    setSimilarWords(findSimilarWords(trimmed, 8));
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) { const data = await res.json(); setMatchedSongs(data.matchedSongs || []); }
    } catch { } finally { setIsLoading(false); }
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
    if (playingSongId === id) { audioRef.current?.pause(); setPlayingSongId(null); }
    else {
      audioRef.current?.pause();
      const a = new Audio(url);
      a.onended = () => setPlayingSongId(null);
      a.play(); audioRef.current = a; setPlayingSongId(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070f] text-white flex flex-col w-full relative overflow-x-hidden">

      {/* AMBIENT GLOWS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex: -1}}>
        <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-violet-700/20 blur-[140px]" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] rounded-full bg-fuchsia-700/15 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[25%] w-[55%] h-[55%] rounded-full bg-indigo-700/10 blur-[140px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#07070f]/85 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Top row: Brand + Search + Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 lg:gap-8 pt-3 pb-2 sm:py-4">
            {/* Brand */}
            <div className="flex items-center justify-between sm:justify-start gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-1 ring-white/15">
                  <Music size={16} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-[0.95rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-pink-300 leading-none tracking-tight">
                    Thai Song Finder
                  </h1>
                  <p className="text-[0.6rem] sm:text-[0.63rem] text-slate-500 mt-0.5 font-medium">ค้นหาจากเนื้อเพลง • พูดก็ได้</p>
                </div>
              </div>

              {/* Mobile AI badge */}
              <div className="sm:hidden flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                <Zap size={10} className="text-violet-400" />
                <span className="text-[0.6rem] font-semibold text-violet-300">AI</span>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full sm:flex-1 sm:max-w-3xl sm:mx-auto">
              <div className={`flex items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 border transition-all duration-300 ${
                isListening
                  ? "bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/10"
                  : "bg-white/[0.04] border-white/[0.08] hover:border-white/[0.14] focus-within:border-violet-500/50 focus-within:bg-violet-500/[0.05] focus-within:shadow-lg focus-within:shadow-violet-500/10"
              }`}>
                <Search size={15} className="text-slate-500 flex-shrink-0" />
                <input
                  type="text"
                  value={isListening ? "🎙️  กำลังฟังเสียง..." : query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="พิมพ์ท่อนเพลงที่จำได้..."
                  readOnly={isListening}
                  className="flex-1 bg-transparent text-[0.88rem] sm:text-[0.95rem] text-white placeholder-slate-600 outline-none min-w-0"
                />
                <button type="button" onClick={toggleMic}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                    isListening ? "bg-rose-500 shadow-md shadow-rose-500/40 animate-pulse" : "bg-white/[0.06] hover:bg-violet-500/30"
                  }`}>
                  {isListening ? <MicOff size={13} className="text-white" /> : <Mic size={13} className="text-violet-300" />}
                </button>
                <button type="submit" disabled={isLoading || !query.trim()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0 active:scale-90 disabled:opacity-30 shadow-md shadow-violet-500/30 transition-all">
                  {isLoading
                    ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <ChevronRight size={14} className="text-white" />}
                </button>
              </div>
            </form>

            {/* Desktop badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 flex-shrink-0">
              <Zap size={11} className="text-violet-400" />
              <span className="text-[0.65rem] font-semibold text-violet-300 hidden lg:block">AI-Powered</span>
            </div>
          </div>

          {/* Quick Pills (horizontal scroll on mobile without scrollbar, wrap on desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-2 pb-2.5 sm:pb-3 overflow-x-auto no-scrollbar sm:flex-wrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SAMPLE_QUERIES.map((p) => (
              <button key={p.value} onClick={() => { setQuery(p.value); doSearch(p.value); }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[0.68rem] sm:text-[0.72rem] font-medium text-slate-400 bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-violet-500/30 hover:text-white transition-all active:scale-95 whitespace-nowrap flex-shrink-0">
                <span className="text-xs sm:text-sm leading-none">{p.emoji}</span>{p.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative z-10 px-4 sm:px-8 lg:px-12 py-5 sm:py-8 pb-24 sm:pb-28 md:pb-10">
        <div className={`max-w-[1400px] mx-auto w-full flex-1 flex flex-col ${!hasSearched ? "justify-center" : ""}`}>

          {/* HERO / EMPTY STATE */}
          {!hasSearched && (
            <div className="flex flex-col items-center text-center py-4 sm:py-12 gap-5 sm:gap-8">
              {/* Icon */}
              <div className="relative">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/25 border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.2)] ring-1 ring-inset ring-white/10 backdrop-blur-sm">
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/10 to-transparent" />
                  <Wand2 size={26} className="text-violet-300 relative z-10 drop-shadow-[0_0_12px_rgba(196,181,253,0.6)] sm:hidden" />
                  <Wand2 size={38} className="text-violet-300 relative z-10 drop-shadow-[0_0_12px_rgba(196,181,253,0.6)] hidden sm:block" />
                </div>
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-30"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-violet-400"></span>
                </span>
              </div>

              <div className="max-w-2xl px-2">
                <h2 className="text-xl sm:text-3xl md:text-[2.6rem] font-extrabold text-white tracking-tight leading-[1.2]">
                  ค้นหาเพลงด้วย
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400"> เนื้อเพลง</span>
                </h2>
                <p className="text-slate-400 text-xs sm:text-[0.95rem] md:text-base mt-1.5 sm:mt-3 leading-relaxed">
                  จำท่อนเพลงไม่ครบ สะกดผิดก็ไม่เป็นไร — AI หาให้ได้เสมอ
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5">
                {[{ icon: <Mic size={11} />, text: "Voice Search" }, { icon: <Zap size={11} />, text: "AI Matching" }, { icon: <Globe size={11} />, text: "เพลงไทย" }].map((f) => (
                  <span key={f.text} className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[0.65rem] sm:text-xs font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20">
                    {f.icon}{f.text}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-5xl mt-1 sm:mt-2">
                {SAMPLE_QUERIES.slice(0, 4).map((q) => (
                  <button key={q.value} onClick={() => { setQuery(q.value); doSearch(q.value); }}
                    className="group flex items-center gap-3.5 sm:gap-5 px-4 py-3 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/35 hover:bg-white/[0.05] active:scale-[0.98] transition-all duration-300 text-left shadow-md shadow-black/20 hover:shadow-[0_8px_40px_rgba(139,92,246,0.12)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 group-hover:from-violet-500/5 to-transparent transition-all duration-500 rounded-2xl sm:rounded-3xl" />
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-violet-500/15 group-hover:border-violet-500/25 transition-all flex-shrink-0">
                      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">{q.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <p className="text-sm sm:text-[1.05rem] font-bold text-white tracking-tight group-hover:text-violet-100 transition-colors">{q.label}</p>
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 mt-0.5">{q.value}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 flex-shrink-0 group-hover:translate-x-1 group-hover:text-violet-400 transition-all duration-300 relative z-10" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {hasSearched && (
            <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
              {/* Tabs */}
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1 p-1 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                  {(["songs", "words"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveView(tab)}
                      className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        activeView === tab
                          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 ring-1 ring-white/15"
                          : "text-slate-500 hover:text-slate-300"
                      }`}>
                      {tab === "songs"
                        ? <><ListMusic size={13} /> เพลง {matchedSongs.length > 0 && <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/15 text-[0.58rem] font-bold">{matchedSongs.length}</span>}</>
                        : <><Sparkles size={13} /> คำใกล้เคียง</>}
                    </button>
                  ))}
                </div>
                {query && <p className="text-xs text-slate-600 truncate hidden sm:block">ผลสำหรับ "<span className="text-slate-400">{query}</span>"</p>}
              </div>

              {/* Loading skeletons */}
              {isLoading && activeView === "songs" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5 sm:p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.07] flex-shrink-0" />
                        <div className="flex-1 space-y-2.5 pt-1">
                          <div className="h-3.5 bg-white/[0.07] rounded-full w-3/4" />
                          <div className="h-3 bg-white/[0.05] rounded-full w-1/2" />
                          <div className="h-2.5 bg-white/[0.04] rounded-full w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Song cards */}
              {activeView === "songs" && !isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-6">
                  {matchedSongs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center py-16 gap-3">
                      <p className="text-4xl sm:text-5xl">🔍</p>
                      <p className="text-slate-400 font-semibold text-sm sm:text-base">ไม่พบเพลงที่ตรงกัน</p>
                      <p className="text-slate-600 text-xs sm:text-sm">ลองพิมพ์เนื้อเพลงอื่น หรือกดไมค์ร้องเพลง</p>
                    </div>
                  ) : (
                    matchedSongs.map((song, idx) => {
                      const score = song.score || 0;
                      const isTop = idx === 0;
                      const isExpanded = expandedSong === song.id;
                      const isPlaying = playingSongId === song.id;
                      return (
                        <div key={song.id}
                          className={`rounded-2xl border overflow-hidden transition-all duration-300 group hover:-translate-y-0.5 ${
                            isTop
                              ? "bg-gradient-to-br from-violet-900/45 via-purple-900/25 to-slate-900/50 border-violet-500/40 shadow-[0_8px_32px_rgba(139,92,246,0.18)] ring-1 ring-violet-500/15"
                              : "bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/30"
                          }`}>
                          {isTop && (
                            <div className="px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 border-b border-violet-500/15 flex items-center gap-1.5">
                              <Sparkles size={10} className="text-violet-400" />
                              <span className="text-[0.62rem] font-bold text-violet-300 tracking-widest uppercase">Best Match</span>
                            </div>
                          )}
                          <div className="p-3.5 sm:p-4">
                            <div className="flex items-start gap-2.5 sm:gap-3">
                              <div className="relative flex-shrink-0">
                                {song.artworkUrl
                                  ? <img src={song.artworkUrl} alt={song.title} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/10 group-hover:scale-[1.03] transition-transform duration-300" />
                                  : <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${song.gradient}`}><Music size={18} className="text-white/60" /></div>
                                }
                                {!isTop && (
                                  <div className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#07070f] border border-slate-700 flex items-center justify-center">
                                    <span className="text-[0.5rem] font-bold text-slate-400">{idx + 1}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <h3 className="font-bold text-[0.88rem] sm:text-[0.93rem] text-white leading-tight line-clamp-1 group-hover:text-violet-100 transition-colors">{song.title}</h3>
                                <p className="text-[0.74rem] sm:text-[0.78rem] text-slate-400 mt-0.5 line-clamp-1">{song.artist}</p>
                                <span className="inline-block mt-1 text-[0.55rem] sm:text-[0.58rem] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-500 border border-white/[0.06] font-medium">{song.moodCategory}</span>
                              </div>
                              <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center ${
                                score >= 0.8 ? "bg-emerald-500/15 border border-emerald-500/25" :
                                score >= 0.5 ? "bg-amber-500/15 border border-amber-500/25" :
                                "bg-white/[0.05] border border-white/[0.08]"}`}>
                                <span className={`text-xs sm:text-sm font-black leading-none ${scoreColor(score)}`}>{Math.round(score * 100)}</span>
                                <span className="text-[0.45rem] text-slate-600 font-medium">%</span>
                              </div>
                            </div>

                            {song.detailedScore && (
                              <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
                                {[
                                  { label: "เนื้อร้อง", val: song.detailedScore.textMatch },
                                  { label: "เสียง", val: song.detailedScore.phoneticMatch },
                                  { label: "ความหมาย", val: song.detailedScore.semanticMatch },
                                ].map(({ label, val }) => (
                                  <div key={label}>
                                    <div className="flex justify-between mb-0.5">
                                      <span className="text-[0.54rem] sm:text-[0.56rem] text-slate-600 font-medium">{label}</span>
                                      <span className="text-[0.54rem] sm:text-[0.56rem] font-mono text-slate-500">{Math.round(val * 100)}%</span>
                                    </div>
                                    <div className="h-1 rounded-full bg-black/50 overflow-hidden">
                                      <div className={`h-full rounded-full ${scoreBarColor(val)} transition-all duration-700`} style={{ width: `${Math.round(val * 100)}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {song.matchedPhrase && song.matchedPhrase.length > 4 && (
                              <div className="mt-2.5 sm:mt-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-violet-500/8 to-transparent border-l-2 border-violet-500/40">
                                <p className="text-[0.7rem] sm:text-[0.73rem] text-slate-400 italic line-clamp-2">"{song.matchedPhrase}"</p>
                              </div>
                            )}

                            {isTop && (
                              <div className="flex gap-2 mt-3 sm:mt-3.5">
                                <a href={song.youtubeUrl} target="_blank" rel="noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/18 active:scale-95 transition-all">
                                  <ExternalLink size={11} /> YouTube
                                </a>
                                <a href={song.spotifyUrl} target="_blank" rel="noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/18 active:scale-95 transition-all">
                                  <ExternalLink size={11} /> Spotify
                                </a>
                              </div>
                            )}

                            {!isTop && (
                              <button onClick={() => setExpandedSong(isExpanded ? null : song.id)}
                                className="mt-2.5 sm:mt-3 w-full text-[0.68rem] text-slate-600 hover:text-violet-400 transition-colors text-center py-0.5">
                                {isExpanded ? "ย่อลง ▲" : "ดูลิงก์เพิ่มเติม ▼"}
                              </button>
                            )}

                            {!isTop && isExpanded && (
                              <div className="mt-2 space-y-2">
                                {song.previewAudioUrl && (
                                  <button onClick={() => toggleAudio(song.id, song.previewAudioUrl)}
                                    className={`w-full flex items-center justify-center gap-2 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all ${
                                      isPlaying ? "bg-violet-600/25 text-violet-300 border border-violet-500/30 animate-pulse" : "bg-white/[0.05] text-slate-400 border border-white/[0.08] hover:text-white"}`}>
                                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                                    {isPlaying ? "กำลังเล่น..." : "🎧 ฟังตัวอย่าง 30 วิ"}
                                  </button>
                                )}
                                <div className="flex gap-2">
                                  <a href={song.youtubeUrl} target="_blank" rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/18 active:scale-95 transition-all">
                                    <ExternalLink size={11} /> YouTube
                                  </a>
                                  <a href={song.spotifyUrl} target="_blank" rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/18 active:scale-95 transition-all">
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

              {/* Word results */}
              {activeView === "words" && (
                <div className="pb-6">
                  <p className="text-xs text-slate-600 mb-2.5 font-medium">คำที่มีความหมายใกล้เคียงกัน (Word Embedding)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
                    {similarWords.length === 0
                      ? <div className="col-span-full flex flex-col items-center py-16 gap-3"><p className="text-4xl">🔤</p><p className="text-slate-500 text-sm">ไม่พบคำใกล้เคียง</p></div>
                      : similarWords.map((item, i) => (
                        <button key={item.word} onClick={() => { setQuery(item.word); doSearch(item.word); setActiveView("songs"); }}
                          className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/[0.06] active:scale-[0.98] transition-all text-left group">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                            <span className="text-[0.58rem] font-bold text-slate-500">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs sm:text-[0.88rem] font-semibold text-white group-hover:text-violet-200 transition-colors">{item.word}</span>
                            <p className="text-[0.6rem] sm:text-[0.63rem] text-slate-500 mt-0.5">{item.category || "ความหมายใกล้เคียง"}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-[0.6rem] sm:text-[0.63rem] font-mono text-violet-400">{Math.round(item.score * 100)}%</span>
                            <div className="w-10 sm:w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${Math.round(item.score * 100)}%` }} />
                            </div>
                          </div>
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-white/[0.07] bg-[#07070f]/90 backdrop-blur-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-around px-4 pt-2 pb-3.5">
          <button onClick={() => setActiveView("songs")}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${activeView === "songs" && hasSearched ? "text-violet-400" : "text-slate-500 hover:text-slate-400"}`}>
            <ListMusic size={20} /><span className="text-[0.62rem] font-semibold">เพลง</span>
          </button>

          <button onClick={toggleMic}
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl ${
              isListening ? "bg-rose-500 shadow-rose-500/50" : "bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-500/40"}`}>
            {isListening && <div className="absolute inset-0 rounded-2xl border-2 border-rose-400/50 animate-ping" />}
            {isListening ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
          </button>

          <button onClick={() => setActiveView("words")}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${activeView === "words" && hasSearched ? "text-violet-400" : "text-slate-500 hover:text-slate-400"}`}>
            <Sparkles size={20} /><span className="text-[0.62rem] font-semibold">คำใกล้เคียง</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
