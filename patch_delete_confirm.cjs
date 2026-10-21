const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'if (!window.confirm("האם למחוק את הפרומפט?")) return;',
  '// if (!window.confirm("האם למחוק את הפרומפט?")) return; // Bypassing due to iframe restrictions'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched window.confirm in delete");
