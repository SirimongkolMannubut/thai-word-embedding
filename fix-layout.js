const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Center the header content and constrain its width so it aligns nicely
code = code.replace(
  '<header className="sticky top-0 z-30 bg-[#080811]/85 backdrop-blur-2xl border-b border-white/5 px-4 pt-6 pb-3">\n        <div className="max-w-6xl mx-auto w-full">',
  '<header className="sticky top-0 z-30 bg-[#080811]/85 backdrop-blur-2xl border-b border-white/5 px-4 pt-6 pb-3">\n        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">'
);

// 2. Fix Brand alignment in header
code = code.replace(
  '<div className="flex items-center gap-2.5 mb-4">',
  '<div className="flex items-center justify-center gap-2.5 mb-4">'
);

// 3. Search form width
code = code.replace(
  '<form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="max-w-3xl">',
  '<form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="w-full">'
);

// 4. Quick pills alignment
code = code.replace(
  '<div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>',
  '<div className="flex justify-center flex-wrap gap-1.5 mt-3 pb-0.5">'
);
// Make the pills wrap nicely instead of scrolling on desktop
// Actually, flex-wrap might look weird on mobile if there are too many. Let's do:
code = code.replace(
  '<div className="flex justify-center flex-wrap gap-1.5 mt-3 pb-0.5">',
  '<div className="flex md:justify-center md:flex-wrap gap-1.5 mt-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>'
);


// 5. Empty State Buttons grid
code = code.replace(
  '<div className="flex flex-col gap-2 w-full max-w-[300px]">',
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-4">'
);

fs.writeFileSync('app/page.tsx', code);
