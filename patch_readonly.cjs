const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add Read Only indicator to the header
const headerRegex = /(<h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight break-words">\{selectedPrompt\.title\}<\/h1>)/;
const headerReplacement = `<div className="flex items-center gap-3">
                          $1
                          {selectedPrompt.isReadOnly && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg whitespace-nowrap">
                              <Lock className="w-3 h-3" />
                              קריאה בלבד
                            </span>
                          )}
                        </div>`;
code = code.replace(headerRegex, headerReplacement);

// Update Read Only button
const buttonRegex = /<button \s*title=\{selectedPrompt\.isReadOnly \? "בטל נעילה לקריאה בלבד" : "נעל לקריאה בלבד"\} \s*onClick=\{[^}]+\} \s*className=\{`p-2 transition-colors rounded-lg \$\{selectedPrompt\.isReadOnly \? 'text-red-500 bg-red-50 dark:bg-red-900\/20' : 'text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 dark:bg-white\/5 dark:hover:bg-red-900\/20'\}`\}\s*>\s*\{selectedPrompt\.isReadOnly \? <Lock className="w-4\.5 h-4\.5" \/> : <Unlock className="w-4\.5 h-4\.5" \/>\}\s*<\/button>/;

const buttonReplacement = `<button 
                            title={selectedPrompt.isReadOnly ? "פרומפט זה נעול לקריאה בלבד ומוגן מפני עריכה. לחץ כדי לבטל נעילה." : "נעל פרומפט - מונע עריכה בטעות"} 
                            onClick={() => handleSave({...selectedPrompt, isReadOnly: !selectedPrompt.isReadOnly})} 
                            className={\`p-2 transition-all duration-300 rounded-lg \${selectedPrompt.isReadOnly ? 'text-red-500 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500/30 animate-pulse' : 'text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-900/20'}\`}
                          >
                            {selectedPrompt.isReadOnly ? <Lock className="w-4.5 h-4.5" /> : <Unlock className="w-4.5 h-4.5" />}
                          </button>`;
code = code.replace(buttonRegex, buttonReplacement);

fs.writeFileSync('src/App.tsx', code);
