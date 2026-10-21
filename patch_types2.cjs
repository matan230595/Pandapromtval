const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "usageHistory?: string[];",
  "usageHistory?: string[];\n  testChatHistory?: {role: 'user'|'assistant', content: string}[];"
);

fs.writeFileSync('src/types.ts', code);
