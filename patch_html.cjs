const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/Prompt Vault/g, "PandaPrompt");
if (!code.includes("favicon-48.png")) {
    code = code.replace('<head>', '<head>\\n    <link rel="icon" href="/favicon-48.png" />');
}

fs.writeFileSync('index.html', code);
console.log("Patched index.html");
