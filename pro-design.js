const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Search Input
code = code.replace(
  'bg-white/[0.05] border-white/10 focus-within:border-violet-500/50 focus-within:bg-violet-900/10',
  'bg-white/[0.03] border-white/10 shadow-inner hover:bg-white/[0.06] focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/60 focus-within:bg-violet-500/[0.04] backdrop-blur-md'
);

// 2. Mic Button
code = code.replace(
  'bg-white/8 hover:bg-violet-500/30',
  'bg-white/10 hover:bg-violet-500/40 hover:text-white shadow-sm hover:shadow-violet-500/20'
);

// 3. Brand Logo Glow
code = code.replace(
  'bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/40',
  'bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgb(139,92,246,0.4)] ring-1 ring-white/20'
);

// 4. Quick Pills
code = code.replace(
  'bg-white/[0.05] border border-white/8 text-[clamp(0.7rem,1.5vw,0.85rem)] text-slate-400 whitespace-nowrap hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-white',
  'bg-white/[0.03] border border-white/10 text-[clamp(0.7rem,1.5vw,0.85rem)] text-slate-300 whitespace-nowrap hover:bg-white/[0.08] hover:border-white/20 hover:text-white backdrop-blur-sm hover:shadow-lg'
);

// 5. Empty State Icon
code = code.replace(
  'bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/8',
  'bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-white/10 shadow-[0_0_30px_rgb(139,92,246,0.15)] ring-1 ring-inset ring-white/5'
);

// 6. Empty State Buttons
code = code.replace(
  'bg-white/[0.04] border border-white/8 hover:bg-violet-500/10 hover:border-violet-500/30 active:scale-97 text-left',
  'bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-transparent active:scale-97 text-left group shadow-lg shadow-black/20'
);
code = code.replace(
  'ChevronRight size={13} className="text-slate-600 flex-shrink-0"',
  'ChevronRight size={13} className="text-slate-500 flex-shrink-0 group-hover:translate-x-1 group-hover:text-violet-400 transition-all"'
);

// 7. Tab Switcher active state
code = code.replace(
  'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md',
  'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_4px_12px_rgb(139,92,246,0.3)] ring-1 ring-white/20'
);

// 8. Song Cards Container (Outer)
code = code.replace(
  'rounded-2xl border overflow-hidden transition-all duration-300',
  'rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-1 group hover:shadow-2xl hover:shadow-violet-900/20 hover:border-white/20'
);

// 9. Song Cards bg conditional (Top vs Normal)
code = code.replace(
  '"bg-gradient-to-br from-violet-900/40 via-purple-900/25 to-transparent border-violet-500/35 shadow-lg shadow-violet-500/10"',
  '"bg-gradient-to-br from-violet-900/40 via-purple-900/20 to-black/40 border-violet-500/40 shadow-[0_8px_30px_rgb(139,92,246,0.15)] ring-1 ring-violet-500/20"'
);
code = code.replace(
  '"bg-white/[0.025] border-white/8"',
  '"bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"'
);

// 10. Song Card Artwork
code = code.replace(
  'border border-white/10',
  'border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-500'
);

// 11. Score Bars track
code = code.replace(
  'h-1 rounded-full bg-white/8 overflow-hidden',
  'h-1.5 rounded-full bg-black/40 shadow-inner overflow-hidden border border-white/[0.02]'
);

// 12. Matched Phrase quote box
code = code.replace(
  'bg-white/5 border-l-2 border-violet-500',
  'bg-gradient-to-r from-violet-500/10 to-transparent border-l-2 border-violet-400'
);

// 13. Bottom Nav
code = code.replace(
  'border-t border-white/5 bg-[#080811]/90 backdrop-blur-2xl',
  'border-t border-white/[0.08] bg-[#080811]/70 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
);

fs.writeFileSync('app/page.tsx', code);
