const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'tags={Array.from(new Set(prompts.flatMap(p => p.tags || [])))}',
  'tags={Array.from(new Set(prompts.flatMap(p => p.tags || []))).filter(Boolean)}'
);

fs.writeFileSync(path, code);
