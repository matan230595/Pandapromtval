const fs = require('fs');
let code = fs.readFileSync('src/components/ComparePromptsView.tsx', 'utf8');

code = code.replace(
  '                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/30">',
  '                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/30 flex-1 overflow-y-auto min-h-0">'
);

code = code.replace(
  '                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0a0a0a]">',
  '                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0a0a0a] min-h-0">'
);

fs.writeFileSync('src/components/ComparePromptsView.tsx', code);
