const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const workflowButton = `
                      <button onClick={() => {
                        setCurrentView("workflows");
                        setIsEditing(false);
                      }} className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-[#1a1a1a] dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/5 shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm ml-2">
                        <GitMerge className="w-4 h-4" /> שרשרת ויזואלית
                      </button>
                      <button onClick={() => {
`;

code = code.replace(
  '<button onClick={() => {',
  workflowButton
);

// We need to replace only the first occurrence which is around line 2005. Let's use regex or split.
// Actually I'll do it safely:
let parts = code.split('                      <button onClick={() => {\n                        const versionName = window.prompt("הכנס שם לגרסה זו');
if (parts.length > 1) {
  let newCode = parts[0] + '                      <button onClick={() => {\n                        setCurrentView("workflows");\n                        setIsEditing(false);\n                      }} className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-[#1a1a1a] dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/5 shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm ml-2">\n                        <GitMerge className="w-4 h-4 text-purple-500" /> שרשרת ויזואלית\n                      </button>\n                      <button onClick={() => {\n                        const versionName = window.prompt("הכנס שם לגרסה זו' + parts[1];
  fs.writeFileSync('src/App.tsx', newCode);
}

