const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add historyCompareIndex state
code = code.replace(
  'const [historyIndex, setHistoryIndex] = useState<number>(0);',
  'const [historyIndex, setHistoryIndex] = useState<number>(0);\n  const [historyCompareIndex, setHistoryCompareIndex] = useState<number>(-1);'
);

// 2. Update the History render block
const newHistoryBlock = `
                      <div className="absolute inset-0 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md z-10 flex flex-col p-4 md:p-6 overflow-hidden rounded-b-2xl">
                        <div className="flex items-center justify-between mb-4 shrink-0 bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                          <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">היסטוריית גרסאות</span>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-center gap-2">
                            <select 
                              value={historyIndex} 
                              onChange={e => setHistoryIndex(Number(e.target.value))}
                              className="text-xs font-mono bg-white dark:bg-[#111] px-2 py-1 rounded-md border border-slate-200 dark:border-white/10 outline-none"
                            >
                              {selectedPrompt.history.map((h, i) => (
                                <option key={i} value={i}>גרסה ישנה: {new Date(h.updatedAt).toLocaleString('he-IL')}</option>
                              ))}
                            </select>
                            <span className="text-slate-400 text-xs px-2">מול</span>
                            <select 
                              value={historyCompareIndex} 
                              onChange={e => setHistoryCompareIndex(Number(e.target.value))}
                              className="text-xs font-mono bg-white dark:bg-[#111] px-2 py-1 rounded-md border border-slate-200 dark:border-white/10 outline-none"
                            >
                              <option value={-1}>גרסה נוכחית (היום)</option>
                              {selectedPrompt.history.map((h, i) => (
                                <option key={i} value={i}>גרסה ישנה: {new Date(h.updatedAt).toLocaleString('he-IL')}</option>
                              ))}
                            </select>
                            
                            <button 
                              onClick={() => {
                                handleRestore(selectedPrompt.history![historyIndex]);
                                setShowHistory(false);
                              }}
                              className="mr-4 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              שחזר לגרסה משמאל
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-500 mb-2 shrink-0">
                          השוואה בין {historyCompareIndex === -1 ? "הגרסה הנוכחית" : \`גרסה מתאריך \${new Date(selectedPrompt.history[historyCompareIndex].updatedAt).toLocaleDateString('he-IL')}\`} לגרסה מתאריך {new Date(selectedPrompt.history[historyIndex].updatedAt).toLocaleDateString('he-IL')}
                        </div>
                        <DiffViewer 
                          oldText={selectedPrompt.history[historyIndex].content} 
                          newText={historyCompareIndex === -1 ? selectedPrompt.content : selectedPrompt.history[historyCompareIndex].content} 
                        />
                      </div>
`;

code = code.replace(
  /<div className="absolute inset-0 bg-white\/95 dark:bg-\[#0a0a0a\]\/95 backdrop-blur-md z-10 flex flex-col p-4 md:p-6 overflow-hidden rounded-b-2xl">[\s\S]*?<DiffViewer \n\s*oldText={selectedPrompt.history\[historyIndex\].content} \n\s*newText={selectedPrompt.content} \n\s*\/>\n\s*<\/div>/m,
  newHistoryBlock
);

fs.writeFileSync(path, code);
console.log("Patched History view");
