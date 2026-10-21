const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("        else setIsPaletteOpen(true);\n        }}\n        setIsOpen={setIsPaletteOpen}", "        else setIsPaletteOpen(true);\n        }}");

fs.writeFileSync('src/App.tsx', code);
