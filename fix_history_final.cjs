const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const startStr = '<div className="flex-1 flex flex-col p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden">';

const startIndex = code.indexOf(startStr);
const diffViewerIndex = code.indexOf('<DiffViewer', startIndex);
const endIndex = code.indexOf('</div>', diffViewerIndex) + 6;

if (startIndex !== -1 && endIndex > startIndex) {
  const newHistoryBlock = `
                      <div className="flex-1 flex flex-col p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0 bg-white dark:bg-[#111] p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                          <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">היסטוריית גרסאות</span>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-center gap-3">
                            <select 
                              value={historyIndex} 
                              onChange={e => setHistoryIndex(Number(e.target.value))}
                              className="text-xs bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 outline-none text-slate-700 dark:text-slate-300 font-mono"
                            >
                              {selectedPrompt.history.map((h, i) => (
                                <option key={i} value={i}>גרסה ישנה: {new Date(h.updatedAt).toLocaleString('he-IL')}</option>
                              ))}
                            </select>
                            <span className="text-slate-400 text-xs px-2 font-bold">מול</span>
                            <select 
                              value={historyCompareIndex} 
                              onChange={e => setHistoryCompareIndex(Number(e.target.value))}
                              className="text-xs bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 outline-none text-slate-700 dark:text-slate-300 font-mono"
                            >
                              <option value={-1}>גרסה נוכחית (היום)</option>
                              {selectedPrompt.history.map((h, i) => (
                                <option key={i} value={i}>גרסה ישנה: {new Date(h.updatedAt).toLocaleString('he-IL')}</option>
                              ))}
                            </select>
                            
                            <button 
                              onClick={() => {
                                handleSave({...selectedPrompt, content: selectedPrompt.history![historyIndex].content});
                                setShowHistory(false);
                                showToast('הפרומפט שוחזר לגרסה הקודמת בהצלחה', 'success');
                              }}
                              className="mr-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              שחזר לצד ימין
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs font-bold text-slate-500 mb-2 shrink-0 px-1">
                          השוואה בין {historyCompareIndex === -1 ? "הגרסה הנוכחית" : \`גרסה מתאריך \${new Date(selectedPrompt.history[historyCompareIndex].updatedAt).toLocaleDateString('he-IL')}\`} (שמאל) לגרסה מתאריך {new Date(selectedPrompt.history[historyIndex].updatedAt).toLocaleDateString('he-IL')} (ימין)
                        </div>
                        <DiffViewer 
                          oldText={selectedPrompt.history[historyIndex].content} 
                          newText={historyCompareIndex === -1 ? selectedPrompt.content : selectedPrompt.history[historyCompareIndex].content} 
                        />
                      </div>`;
  code = code.substring(0, startIndex) + newHistoryBlock + code.substring(endIndex);
  fs.writeFileSync(path, code);
  console.log("Success");
} else {
  console.log("Not found");
}
