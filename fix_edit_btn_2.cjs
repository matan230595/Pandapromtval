const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<button title="ערוך פרומפט" onClick=\{\(\) => \{ setEditingPrompt\(selectedPrompt\); setIsEditing\(true\); \}\} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 hover:bg-blue-50 dark:bg-white\/5 dark:hover:bg-blue-900\/20 rounded-lg">\s*<Edit3 className="w-4\.5 h-4\.5" \/>\s*<\/button>\s*\)\}/,
  `{!selectedPrompt.isReadOnly && (
    <button title="ערוך פרומפט" onClick={() => { setEditingPrompt(selectedPrompt); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-900/20 rounded-lg">
      <Edit3 className="w-4.5 h-4.5" />
    </button>
  )}`
);

fs.writeFileSync('src/App.tsx', code);
