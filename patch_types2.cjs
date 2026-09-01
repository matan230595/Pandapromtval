const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  '  updatedAt: string;\n  dueDate?: string;\n}',
  '  updatedAt: string;\n}'
);

code = code.replace(
  '  updatedAt: string;\n  useCount: number;',
  '  updatedAt: string;\n  useCount: number;\n  dueDate?: string;'
);

fs.writeFileSync('src/types.ts', code);
