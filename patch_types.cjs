const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  '  updatedAt: string;',
  '  updatedAt: string;\n  versionName?: string;'
);

fs.writeFileSync('src/types.ts', code);
