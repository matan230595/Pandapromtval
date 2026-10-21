const fs = require('fs');
let path = 'index.html';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\\n/g, '\n');

fs.writeFileSync(path, code);
