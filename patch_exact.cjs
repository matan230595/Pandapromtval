const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('<textarea<textarea\\n', '<textarea\\n');
code = code.replace('<textarea<textarea', '<textarea');

fs.writeFileSync('src/App.tsx', code);
