const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'onClose={() => setDuePrompt(null)}',
  'onClose={() => { if (duePrompt) handleSave({...duePrompt, dueDate: undefined}); setDuePrompt(null); }}'
);

fs.writeFileSync('src/App.tsx', code);
