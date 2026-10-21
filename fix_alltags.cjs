const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const allTags = useMemo(() => Array.from(new Set(prompts.flatMap(p => p.tags || []))).sort(), [prompts]);',
  'const allTags = useMemo(() => Array.from(new Set(prompts.flatMap(p => p.tags || []))).filter(Boolean).sort(), [prompts]);'
);

fs.writeFileSync(path, code);
