const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(
  '<div className={max-w-6xl mx-auto w-full flex-1 flex flex-col }>',
  '<div className={max-w-6xl mx-auto w-full flex-1 flex flex-col }>'
);

fs.writeFileSync('app/page.tsx', code);
