const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  '  updatedAt: string;\n',
  '  updatedAt: string;\n  isAIOptimized?: boolean;\n  aiOptimized?: boolean;\n'
);

fs.writeFileSync('src/types.ts', code);
