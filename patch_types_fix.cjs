const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  '  updatedAt: string;\n  useCount: number;',
  '  updatedAt: string;\n  useCount: number;\n  currentVersionName?: string;\n  description?: string;'
);

fs.writeFileSync('src/types.ts', code);
