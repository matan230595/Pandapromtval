const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const handleCreateFolder = async (name: string) => {',
  'const handleCreateFolder = async (name: string, color?: string) => {'
);
code = code.replace(
  'name,\n      createdAt: new Date().toISOString()',
  'name,\n      color,\n      createdAt: new Date().toISOString()'
);

// We need to find where the sidebar folders are rendered.
// Let's search for "folders.map("
