const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove kanban button
code = code.replace(/<button title="לוח קאנבן".*?<\/button>/, '');

// Update the list layout conditionally based on viewMode
const listAnchor = `<div className="grid grid-cols-1 gap-3">`;
const listReplacement = `<div className={\`grid gap-4 \${viewMode === 'grid' && !selectedPromptId && !isEditing ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}\`}>`;

code = code.replace(listAnchor, listReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched viewMode logic.");
