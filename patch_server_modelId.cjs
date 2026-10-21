const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const { messages, systemInstruction, temperature } = req.body;',
  'const { messages, systemInstruction, temperature, modelId } = req.body;'
);

code = code.replace(
  'model: "gemini-3.5-flash",',
  'model: modelId || "gemini-3.5-flash",'
);

fs.writeFileSync('server.ts', code);
