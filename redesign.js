const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Ambient Background (Bigger, more vibrant glows)
code = code.replace(
  '<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl" />\n        <div className="absolute top-1/3 right-[-60px] w-48 h-48 rounded-full bg-pink-600/12 blur-3xl" />\n        <div className="absolute bottom-1/4 left-[-40px] w-40 h-40 rounded-full bg-indigo-600/12 blur-3xl" />',
  '<div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-violet-600/20 blur-[100px] pointer-events-none" />\n        <div className="absolute top-1/4 -right-20 w-[25rem] h-[25rem] rounded-full bg-fuchsia-600/15 blur-[100px] pointer-events-none" />\n        <div className="absolute bottom-1/4 -left-20 w-[20rem] h-[20rem] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />'
);

// 2. Brand Title
code = code.replace(
  'className="text-[clamp(1rem,3vw,1.25rem)] font-bold text-white leading-tight"',
  'className="text-[clamp(1.25rem,4vw,1.5rem)] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 leading-tight tracking-tight"'
);

// 3. Search Bar wrapper with outer glow
code = code.replace(
  '<form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full">',
  '<form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full relative group">\n          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-fuchsia-500/0 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>\n          <div className="relative">'
);
code = code.replace(
  '</form>',
  '</div>\n        </form>'
);

// 4. Search Bar styling (larger, more padding)
code = code.replace(
  'flex items-center gap-2 rounded-2xl px-3.5 py-2.5',
  'flex items-center gap-3 rounded-2xl px-4 py-3 sm:py-3.5'
);
code = code.replace(
  'Search size={15}',
  'Search size={18}'
);

// 5. Empty State Title
code = code.replace(
  'text-[clamp(1rem,3vw,1.25rem)] font-bold text-white',
  'text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-white tracking-tight'
);

// 6. Empty State Icon (make it larger and cooler)
code = code.replace(
  'w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-white/10 shadow-[0_0_30px_rgb(139,92,246,0.15)] ring-1 ring-inset ring-white/5 flex items-center justify-center',
  'w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgb(139,92,246,0.2)] ring-1 ring-inset ring-white/10 flex items-center justify-center relative overflow-hidden\"><div className=\"absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50\"></div><div className=\"relative'
);
code = code.replace(
  '<Wand2 size={28} className="text-violet-400" />',
  '<Wand2 size={36} className="text-violet-300 drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]" /></div>'
); // close the relative div added above

// 7. Empty State Buttons (Make them look like bento boxes)
code = code.replace(
  'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl mt-4',
  'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-4xl mt-6'
);
code = code.replace(
  'flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-transparent active:scale-97 transition-all text-left group shadow-lg shadow-black/20 hover:shadow-violet-500/10',
  'flex items-center gap-4 px-5 py-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] active:scale-95 transition-all text-left group shadow-lg shadow-black/20 hover:shadow-[0_8px_30px_rgb(139,92,246,0.12)] relative overflow-hidden'
);
code = code.replace(
  '<span className="text-xl">{q.emoji}</span>',
  '<div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors"><span className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform">{q.emoji}</span></div>'
);
code = code.replace(
  'text-[clamp(0.875rem,2vw,1rem)] font-semibold text-white',
  'text-[clamp(1rem,2vw,1.125rem)] font-bold text-white tracking-tight'
);
code = code.replace(
  'text-[clamp(0.65rem,1.5vw,0.8rem)] text-slate-500 truncate',
  'text-[clamp(0.75rem,1.5vw,0.875rem)] text-slate-400 line-clamp-1 mt-0.5'
);

fs.writeFileSync('app/page.tsx', code);
