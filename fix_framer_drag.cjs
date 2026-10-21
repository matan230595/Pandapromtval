const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "onDragStart={(e: React.DragEvent) => e.dataTransfer.setData('text/plain', p.id)}",
  "// @ts-ignore\n                        onDragStart={(e: any) => e.dataTransfer.setData('text/plain', p.id)}"
);

fs.writeFileSync('src/App.tsx', code);
