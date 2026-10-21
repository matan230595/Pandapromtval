const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  'const contentString = newPrompt.content.toLowerCase();',
  'const contentString = (newPrompt.content || "").toLowerCase();'
);
fs.writeFileSync(path, code);
console.log("Patched content string in rules");
