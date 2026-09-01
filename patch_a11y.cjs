const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'className={`w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer ${!selectedPromptId && !isEditing ? \'\' : \'mt-1\'}`}',
  'className={`w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none ${!selectedPromptId && !isEditing ? \'\' : \'mt-1\'}`}'
);

fs.writeFileSync('src/App.tsx', code);
