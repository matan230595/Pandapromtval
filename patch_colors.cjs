const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace('--bg-dark: #0a0a0a;', '--bg-dark: #0F0C1D;');
code = code.replace('rgba(17, 17, 17, 0.7)', 'rgba(26, 22, 48, 0.7)');
code = code.replace('background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);', 'background-image: radial-gradient(rgba(124, 58, 237, 0.05) 1px, transparent 1px);');

fs.writeFileSync('src/index.css', code);
console.log("Patched index.css colors");
