const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const brokenSidebar = `                      <button onClick={() => {
                        setCurrentView("workflows");
                        setIsEditing(false);
                      }} className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-[#1a1a1a] dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/5 shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm ml-2">
                        <GitMerge className="w-4 h-4" /> שרשרת ויזואלית
                      </button>
                      <button onClick={() => {`;

code = code.replace(brokenSidebar, '<button onClick={() => {');

fs.writeFileSync('src/App.tsx', code);
