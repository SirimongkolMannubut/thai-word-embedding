const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Outermost wrapper
code = code.replace(
  '<div className="min-h-screen bg-[#080811] text-white flex flex-col w-full max-w-5xl mx-auto relative overflow-x-hidden">',
  '<div className="min-h-screen bg-[#080811] text-white flex flex-col w-full relative overflow-x-hidden">'
);

// 2. Header
code = code.replace(
  '<header className="sticky top-0 z-30 bg-[#080811]/85 backdrop-blur-2xl border-b border-white/5 px-4 pt-10 pb-3">',
  '<header className="sticky top-0 z-30 bg-[#080811]/85 backdrop-blur-2xl border-b border-white/5 px-4 pt-6 pb-3">\n        <div className="max-w-6xl mx-auto w-full">'
);
code = code.replace(
  '</header>',
  '</div>\n      </header>'
);

// 3. Main
code = code.replace(
  '<main className="flex-1 px-4 py-4 pb-28 relative z-10">',
  '<main className="flex-1 px-4 py-6 pb-28 relative z-10">\n        <div className="max-w-6xl mx-auto w-full">'
);
code = code.replace(
  '</main>',
  '</div>\n      </main>'
);

// 4. Update Grids for Desktop
code = code.replace(
  /grid-cols-1 md:grid-cols-2 lg:grid-cols-2/g,
  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
);

code = code.replace(
  /grid-cols-1 sm:grid-cols-2 md:grid-cols-3/g,
  'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
);

// 5. Expand the search bar to look good on wide screens, but not too wide
// Currently it is wrapped in <form>. Let's let it be full width of the 6xl container, or maybe limit to max-w-3xl.
code = code.replace(
  '<form onSubmit={(e) => { e.preventDefault(); doSearch(query); }}>',
  '<form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="max-w-3xl">'
);

fs.writeFileSync('app/page.tsx', code);
