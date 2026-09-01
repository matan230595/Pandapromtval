const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexEditor = /(<div className="w-full bg-slate-50 dark:bg-\[#0a0a0a\] border border-slate-200 dark:border-white\/10 rounded-xl outline-none focus-within:ring-2 focus-within:ring-blue-500\/50 text-sm font-mono text-slate-900 dark:text-white" dir="auto" style={{ minHeight: '256px' }}>[\s\S]*?<\/Editor>\n\s*<\/div>)/;

const replacementEditor = `$1
                      <div className="mt-2 flex items-center justify-end text-[11px] font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          {editingPrompt?.content?.length || 0} תווים 
                          <span className="text-slate-300 dark:text-slate-600">|</span> 
                          ~{Math.round((editingPrompt?.content?.length || 0) / 4)} Tokens
                        </span>
                      </div>`;

code = code.replace(regexEditor, replacementEditor);
fs.writeFileSync('src/App.tsx', code);
