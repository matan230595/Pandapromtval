const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  '(p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.toLowerCase().includes(q))))',
  '((p.title || "").toLowerCase().includes(q) || (p.content || "").toLowerCase().includes(q) || (p.tags && p.tags.some(t => (t || "").toLowerCase().includes(q))))'
);
fs.writeFileSync(path, code);
console.log("Patched App.tsx includes");
