const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'if (window.confirm("יש לך טיוטה לא שמורה. האם תרצה לשחזר אותה?")) {',
  'if (true) { // Auto-restore draft without window.confirm due to iframe restrictions'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched window.confirm in handleOpenNewEditor");
