const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes("font-family: 'Rubik'")) {
    code = code.replace("body {", "body {\\n    font-family: 'Rubik', 'Plus Jakarta Sans', sans-serif;");
    fs.writeFileSync('src/index.css', code);
    console.log("Patched fonts in index.css");
} else {
    console.log("Fonts already patched");
}
