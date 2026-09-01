const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<textarea<textarea\s*/, '<textarea\n                              ');

fs.writeFileSync('src/App.tsx', code);
