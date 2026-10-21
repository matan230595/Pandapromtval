const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'onImport={(p) => { handleOpenNewEditor(); }}',
  'onImport={(p) => { setEditingPrompt(p); setIsEditing(true); setSelectedPromptId(null); setCurrentView("library"); }}'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched CommunityView onImport");
