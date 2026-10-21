const fs = require('fs');

let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix FileText import
code = code.replace(
  'ArrowDownAZ, Clock,',
  'ArrowDownAZ, Clock, FileText,'
);

// Fix Object.entries(grouped) type
code = code.replace(
  'for (const [folder, pList] of Object.entries(grouped)) {',
  'for (const [folder, pList] of Object.entries(grouped as Record<string, typeof prompts>)) {'
);

fs.writeFileSync(path, code);
