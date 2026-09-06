const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Fix the Pill that was messed up by global replace
code = code.replace(
  'bg-white/[0.03] border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-500 text-[clamp',
  'bg-white/[0.03] border border-white/10 text-[clamp'
);

// Fix the Empty State Icon if it was messed up
code = code.replace(
  'border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-500 shadow-[0_0_30px_rgb(139,92,246,0.15)] ring-1 ring-inset ring-white/5',
  'border border-white/10 shadow-[0_0_30px_rgb(139,92,246,0.15)] ring-1 ring-inset ring-white/5'
);

// Add the hover effect to the Empty state buttons properly
code = code.replace(
  'bg-white/[0.04] border border-white/8 hover:bg-violet-500/10 hover:border-violet-500/30 active:scale-97 transition-all text-left',
  'bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-transparent active:scale-97 transition-all text-left group shadow-lg shadow-black/20 hover:shadow-violet-500/10'
);

fs.writeFileSync('app/page.tsx', code);
