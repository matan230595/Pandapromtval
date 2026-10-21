const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/body \{\\n    font-family: 'Rubik', 'Plus Jakarta Sans', sans-serif;/g, 'body {');

// find the second @layer base and body
code = code.replace(/@layer base \{\s*body \{/g, "@layer base {\n  body {\n    font-family: 'Rubik', 'Plus Jakarta Sans', sans-serif;");

fs.writeFileSync('src/index.css', code);
