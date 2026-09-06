const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(
  /<div className="fixed inset-0 pointer-events-none overflow-hidden">[\s\S]*?<\/div>/,
  '<div className="fixed inset-0 pointer-events-none overflow-hidden">\n        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen" />\n        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/15 blur-[120px] mix-blend-screen" />\n        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />\n      </div>'
);

fs.writeFileSync('app/page.tsx', code);
