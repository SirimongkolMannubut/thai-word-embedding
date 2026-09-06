const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Header Padding
code = code.replace(
  'px-4 pt-6 pb-3',
  'px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-4'
);

// Typography Brand
code = code.replace(
  'text-sm font-bold text-white leading-tight',
  'text-[clamp(1rem,3vw,1.25rem)] font-bold text-white leading-tight'
);
code = code.replace(
  'text-[10px] text-slate-500',
  'text-[clamp(0.65rem,2vw,0.85rem)] text-slate-500'
);

// Pills (Category/Tags) - wrap on mobile and adjust gaps
code = code.replace(
  '<div className="flex md:justify-center md:flex-wrap gap-1.5 mt-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>',
  '<div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mt-4 pb-1">'
);

// Pill Text
code = code.replace(
  'text-[10px] whitespace-nowrap',
  'text-[clamp(0.7rem,1.5vw,0.85rem)] whitespace-nowrap'
);

// Main Layout
code = code.replace(
  'px-4 py-6 pb-28',
  'px-4 sm:px-6 md:px-8 py-6 sm:py-8 pb-28 md:pb-12'
);

// Empty State Typography
code = code.replace(
  'text-sm font-bold mt-4 mb-1',
  'text-[clamp(1.125rem,4vw,1.5rem)] font-bold mt-4 mb-2'
);
code = code.replace(
  'text-[10px] text-slate-400 mb-6 max-w-[200px]',
  'text-[clamp(0.75rem,2vw,1rem)] text-slate-400 mb-6 max-w-[80%] sm:max-w-sm mx-auto'
);
code = code.replace(
  'grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-4',
  'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl mt-4'
);

// Grids
code = code.replace(
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6',
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-6'
);
code = code.replace(
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-6',
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-6'
);

// Song Typography
code = code.replace(
  'text-sm font-bold text-white truncate',
  'text-[clamp(0.875rem,2.5vw,1.125rem)] font-bold text-white truncate'
);
code = code.replace(
  'text-[10px] text-slate-400 truncate',
  'text-[clamp(0.7rem,2vw,0.875rem)] text-slate-400 truncate'
);
code = code.replace(
  'text-[9px] text-emerald-400',
  'text-[clamp(0.6rem,1.5vw,0.75rem)] text-emerald-400'
);
code = code.replace(
  'text-[9px] text-slate-400 ml-1',
  'text-[clamp(0.6rem,1.5vw,0.75rem)] text-slate-400 ml-1'
);

// Match Phrase
code = code.replace(
  'text-[10px] text-slate-300 italic',
  'text-[clamp(0.75rem,2vw,0.875rem)] text-slate-300 italic'
);

// Search Bar Input
code = code.replace(
  'flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none',
  'flex-1 bg-transparent text-[clamp(0.875rem,2vw,1rem)] text-white placeholder-slate-600 outline-none w-full'
);

// Score bars text
code = code.replace(
  /text-\[9px\] text-white\/60/g,
  'text-[clamp(0.6rem,1.5vw,0.75rem)] text-white/60'
);
code = code.replace(
  /text-\[8px\] font-bold/g,
  'text-[clamp(0.55rem,1.2vw,0.7rem)] font-bold'
);

// Tab Switcher
code = code.replace(
  'text-[11px] font-medium',
  'text-[clamp(0.7rem,2vw,0.9rem)] font-medium'
);

// Loading Skeleton
code = code.replace(
  'grid grid-cols-1 md:grid-cols-2 gap-4 pb-6',
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-6'
);


fs.writeFileSync('app/page.tsx', code);
