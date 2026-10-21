const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// Remove from PromptVersion
code = code.replace('  isAIOptimized?: boolean;\n  aiOptimized?: boolean;\n', '');

// Add to Prompt
code = code.replace(
  '  useCount: number;\n',
  '  useCount: number;\n  isAIOptimized?: boolean;\n  aiOptimized?: boolean;\n'
);

fs.writeFileSync('src/types.ts', code);
