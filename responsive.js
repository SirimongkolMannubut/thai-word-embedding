const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace(/\{activeView === "songs" && !isLoading && \(\s*<div className="space-y-2\.5">/, '{activeView === "songs" && !isLoading && (\n              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pb-6">');
code = code.replace(/\{activeView === "words" && \(\s*<div className="space-y-2">/, '{activeView === "words" && (\n              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pb-6">');
code = code.replace(/\{isLoading && activeView === "songs" && \(\s*<div className="space-y-3">/, '{isLoading && activeView === "songs" && (\n              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">');

fs.writeFileSync('app/page.tsx', code);
