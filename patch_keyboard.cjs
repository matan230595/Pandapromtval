const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'onChange={e => setInlineEditValue(e.target.value)}',
  'onChange={e => setInlineEditValue(e.target.value)}\n                                onKeyDown={(e) => {\n                                  if (e.key === "Escape") setInlineEditingId(null);\n                                }}'
);
fs.writeFileSync('src/App.tsx', code);
