const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '} else if (selectedFolder === "archive") {',
  '} else if (selectedFolder === "recent") {\n        list = [...list].filter(p => p.lastUsedAt).sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime());\n      } else if (selectedFolder === "archive") {'
);

fs.writeFileSync(path, code);
