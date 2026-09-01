const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badCode = `                  className={\`\${pulsingPromptId === p.id ? 'animate-pulse ring-2 ring-blue-500 shadow-lg' : ''} \${selectedPromptId === p.id ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50 shadow-sm" : "bg-white dark:bg-[#151515] hover:border-slate-300 dark:hover:border-white/20 border-slate-200 dark:border-white/10 shadow-sm"}\`}
                    className={\`p-3 cursor-pointer rounded-xl border transition-all \${selectedPromptId === p.id ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}\`}`;

const goodCode = `                  className={\`p-3 cursor-pointer rounded-xl border transition-all \${pulsingPromptId === p.id ? 'animate-pulse ring-2 ring-blue-500 shadow-lg' : ''} \${selectedPromptId === p.id ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}\`}`;

code = code.replace(badCode, goodCode);

fs.writeFileSync('src/App.tsx', code);
