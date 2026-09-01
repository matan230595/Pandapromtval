const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const restoreUI = `
                            <button 
                              onClick={() => {
                                handleSave({
                                  ...selectedPrompt,
                                  content: selectedPrompt.history![historyIndex].content
                                });
                                setShowHistory(false);
                                showToast('הפרומפט שוחזר לגרסה הקודמת בהצלחה', 'success');
                              }}
                              className="px-3 py-1.5 ml-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-amber-200 dark:border-amber-800/30"
                            >
                              <History className="w-3.5 h-3.5" />
                              שחזר לגרסה זו
                            </button>
                            <button onClick={() => setHistoryIndex(Math.min(historyIndex + 1, selectedPrompt.history!.length - 1))}
`;

code = code.replace(/<button onClick=\{\(\) => setHistoryIndex\(Math\.min\(historyIndex \+ 1, selectedPrompt\.history!\.length - 1\)\)\}/, restoreUI);

fs.writeFileSync('src/App.tsx', code);
