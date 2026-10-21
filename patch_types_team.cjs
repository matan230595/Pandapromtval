const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  '  keyboardShortcut?: string;\n  chainNextPromptId?: string;\n}',
  '  keyboardShortcut?: string;\n  chainNextPromptId?: string;\n  teamComments?: PromptComment[];\n  isPublic?: boolean;\n}'
);

fs.writeFileSync('src/types.ts', code);
