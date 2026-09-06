const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Header Width (Expand from max-w-4xl to max-w-6xl)
code = code.replace(
  '<div className="max-w-4xl mx-auto w-full flex flex-col items-center">',
  '<div className="max-w-6xl mx-auto w-full flex flex-col items-center">'
);

// 2. Search Bar Width (Allow it to be wider, ~80% of container)
code = code.replace(
  '<form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full relative group">',
  '<form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full max-w-4xl relative group">'
);

// 3. Main container - Adjust classes to enable vertical centering when empty
code = code.replace(
  '<main className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-28 md:pb-12 relative z-10">',
  '<main className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-28 md:pb-12 relative z-10">'
);
code = code.replace(
  '<div className="max-w-6xl mx-auto w-full">',
  '<div className={max-w-6xl mx-auto w-full flex-1 flex flex-col }>'
);

// 4. Empty State wrapper - Make it fill available height and center content
code = code.replace(
  '<div className="flex flex-col items-center text-center py-12 gap-5">',
  '<div className="flex flex-col items-center text-center gap-6 md:gap-8 py-10 w-full">'
);

// 5. Empty State Bento Grid - Wider (max-w-5xl) and more spacing
code = code.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-4xl mt-6">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full max-w-5xl mt-6 md:mt-10">'
);

// 6. Empty State Cards - Make them taller with more padding
code = code.replace(
  'className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] active:scale-95 transition-all text-left group shadow-lg shadow-black/20 hover:shadow-[0_8px_30px_rgb(139,92,246,0.12)] relative overflow-hidden"',
  'className="flex items-center gap-5 px-6 py-6 sm:py-7 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] active:scale-95 transition-all text-left group shadow-lg shadow-black/20 hover:shadow-[0_8px_30px_rgb(139,92,246,0.12)] relative overflow-hidden"'
);

// 7. Empty state emoji box - Make slightly larger
code = code.replace(
  '<div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors"><span className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform">{q.emoji}</span></div>',
  '<div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors flex-shrink-0"><span className="text-2xl sm:text-3xl drop-shadow-md group-hover:scale-110 transition-transform">{q.emoji}</span></div>'
);

// 8. Empty state card text - slightly larger to match new card size
code = code.replace(
  '<p className="text-[clamp(1rem,2vw,1.125rem)] font-bold text-white tracking-tight">{q.label}</p>',
  '<p className="text-[clamp(1.125rem,2.5vw,1.25rem)] font-bold text-white tracking-tight mb-0.5">{q.label}</p>'
);
code = code.replace(
  '<p className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-slate-400 line-clamp-1 mt-0.5">{q.value}</p>',
  '<p className="text-[clamp(0.85rem,1.5vw,1rem)] text-slate-400 line-clamp-1">{q.value}</p>'
);

fs.writeFileSync('app/page.tsx', code);
