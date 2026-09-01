const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<button \s*title=\{selectedPrompt\.isReadOnly \? "בטל נעילה לקריאה בלבד" : "נעל לקריאה בלבד"\}[\s\S]*?<\/button>/;
const replacement = `<button 
                            title={selectedPrompt.isReadOnly ? "פרומפט זה נעול לקריאה בלבד ומוגן מפני עריכה. לחץ כדי לבטל נעילה." : "נעל פרומפט - מונע עריכה בטעות"} 
                            onClick={() => handleSave({...selectedPrompt, isReadOnly: !selectedPrompt.isReadOnly})} 
                            className={\`p-2 transition-all duration-300 rounded-lg \${selectedPrompt.isReadOnly ? 'text-red-500 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500/30 animate-[pulse_2s_ease-in-out_infinite]' : 'text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-900/20'}\`}
                          >
                            {selectedPrompt.isReadOnly ? <Lock className="w-4.5 h-4.5" /> : <Unlock className="w-4.5 h-4.5" />}
                          </button>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
