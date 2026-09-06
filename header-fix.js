const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Fix the syntax error first!
code = code.replace(
  '<div className={max-w-6xl mx-auto w-full flex-1 flex flex-col }>',
  '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col  }>'
);
// Also replace it if it's already partly fixed but wrong
code = code.replace(
  '<div className={max-w-6xl mx-auto w-full flex-1 flex flex-col  }>',
  '<div className={max-w-[1400px] mx-auto w-full flex-1 flex flex-col  }>'
);

// Header restructure
// Current header starts with:
// <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
//         {/* Brand */}
//         <div className="flex items-center justify-center gap-2.5 mb-4">
// Let's replace the whole top part of the header.

const oldHeader = <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgb(139,92,246,0.4)] ring-1 ring-white/20">
            <Music size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[clamp(1.25rem,4vw,1.5rem)] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 leading-tight tracking-tight">Thai Song Finder</h1>
            <p className="text-[clamp(0.65rem,2vw,0.85rem)] text-slate-500">????????????????? • ????????</p>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full max-w-4xl relative group">;

const newHeader = <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4 lg:gap-8 mb-4 lg:mb-6">
          {/* Brand */}
          <div className="flex items-center justify-center lg:justify-start gap-3 w-full lg:w-[250px] flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgb(139,92,246,0.4)] ring-1 ring-white/20">
              <Music size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[clamp(1.1rem,4vw,1.25rem)] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 leading-tight tracking-tight">Thai Song Finder</h1>
              <p className="text-[clamp(0.6rem,2vw,0.75rem)] text-slate-500">????????????????? • ????????</p>
            </div>
          </div>

          {/* Search Input */}
          <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full max-w-3xl flex-1 relative group">;

code = code.replace(oldHeader, newHeader);

// We also need to add a spacer div on the right side of the search bar to keep it centered on Desktop
const searchCloseTag = </div>
        </div>
        </form>;
const searchCloseTagWithSpacer = </div>
        </div>
        </form>
        {/* Spacer for centering search on large screens */}
        <div className="hidden lg:block lg:w-[250px] flex-shrink-0"></div>
        </div>;
code = code.replace(searchCloseTag, searchCloseTagWithSpacer);

// Update Empty State Bento grid max-w to be slightly larger (max-w-6xl instead of max-w-5xl)
code = code.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full max-w-5xl mt-6 md:mt-10">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full max-w-6xl mt-6 md:mt-10">'
);

// Remove the mb-4 from the lex flex-col items-center at the top if it was there (actually I already replaced it)
// But I need to adjust Quick Pills padding/margin so it's flush
code = code.replace(
  '<div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mt-4 pb-1">',
  '<div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-2.5 pb-1 w-full">'
);


fs.writeFileSync('app/page.tsx', code);
