const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Empty State Typography
code = code.replace(
  'text-base font-bold text-white',
  'text-[clamp(1rem,3vw,1.25rem)] font-bold text-white'
);
code = code.replace(
  'text-slate-400 text-xs mt-1.5 leading-relaxed max-w-[260px]',
  'text-slate-400 text-[clamp(0.75rem,2vw,0.875rem)] mt-1.5 leading-relaxed max-w-[85%] sm:max-w-sm mx-auto'
);

// Empty State Buttons text
code = code.replace(
  'text-sm font-semibold text-white',
  'text-[clamp(0.875rem,2vw,1rem)] font-semibold text-white'
);
code = code.replace(
  /text-\[11px\] text-slate-500 truncate/g,
  'text-[clamp(0.65rem,1.5vw,0.8rem)] text-slate-500 truncate'
);

// Tab Switcher
code = code.replace(
  'text-xs font-semibold',
  'text-[clamp(0.75rem,2vw,0.875rem)] font-semibold'
);

// Pill texts
code = code.replace(
  'text-[11px] text-slate-400 whitespace-nowrap',
  'text-[clamp(0.7rem,1.5vw,0.85rem)] text-slate-400 whitespace-nowrap'
);
code = code.replace(
  'text-[10px] font-medium',
  'text-[clamp(0.65rem,1.5vw,0.8rem)] font-medium'
);

// Song Results
code = code.replace(
  'text-xs font-semibold text-slate-300',
  'text-[clamp(0.75rem,2vw,0.875rem)] font-semibold text-slate-300'
);
code = code.replace(
  'text-sm font-bold text-white',
  'text-[clamp(0.875rem,2.5vw,1.125rem)] font-bold text-white'
);

// Search input
code = code.replace(
  'text-[clamp(0.875rem,2vw,1rem)]',
  'text-[clamp(1rem,2vw,1.125rem)]' // Make search text slightly bigger
);

// Words state
code = code.replace(
  'text-[10px] text-slate-600 px-1 pb-1',
  'text-[clamp(0.65rem,1.5vw,0.85rem)] text-slate-600 px-1 pb-1'
);
code = code.replace(
  'text-xs font-semibold text-white truncate',
  'text-[clamp(0.75rem,2vw,1rem)] font-semibold text-white truncate'
);

fs.writeFileSync('app/page.tsx', code);
