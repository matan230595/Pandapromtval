const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'model: modelId || "gemini-3.5-flash",',
  'model: req.body.modelId || "gemini-3.5-flash",'
);
fs.writeFileSync('server.ts', code);
