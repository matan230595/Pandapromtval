const fs = require('fs');
let code = fs.readFileSync('metadata.json', 'utf8');
code = code.replace("Prompt Vault", "PandaPrompt");
fs.writeFileSync('metadata.json', code);
