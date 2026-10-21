const fs = require('fs');
let path = 'tsconfig.json';
let code = fs.readFileSync(path, 'utf8');

let json = JSON.parse(code);
json.exclude = ["dist", "node_modules"];
fs.writeFileSync(path, JSON.stringify(json, null, 2));
