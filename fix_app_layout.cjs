const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The block we want to replace starts at: `<div className="flex-1 p-6 lg:p-8 bg-slate-50`
// and ends at: `) : null}` (around line 1692)

const regex = /<div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-\[#0a0a0a\] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900\/50 flex flex-col">[\s\S]*?\)\s*:\s*null\}/;

const replacement = `<div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900/50 flex flex-col 2xl:flex-row gap-8">
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="font-mono text-[15px] leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 flex-1" dir="auto" dangerouslySetInnerHTML={{ __html: Prism.highlight(selectedPrompt.content, Prism.languages.markdown, 'markdown') }} />

                        {selectedPrompt.exampleOutput && (
                          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-indigo-500 flex items-center gap-2">
                              <Terminal className="w-4 h-4" />
                              פלט לדוגמה
                            </label>
                            <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-xl text-[14px] font-mono leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-200/50 dark:border-white/10" dir="auto">
                              {selectedPrompt.exampleOutput}
                            </div>
                          </div>
                        )}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פתקים מהירים (Quick Notes)</label>
                          <textarea
                            value={selectedPrompt.notes || ''}
                            onChange={(e) => {
                              const newPrompts = prompts.map(p => p.id === selectedPrompt.id ? {...p, notes: e.target.value} : p);
                              setPrompts(newPrompts); // Optimistic UI update
                            }}
                            onBlur={(e) => handleSave({...selectedPrompt, notes: e.target.value})}
                            placeholder="רשום לעצמך הערות, הקשר או טיפים לשימוש בפרומפט הזה..."
                            className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white resize-y min-h-[80px]"
                            dir="auto"
                          />
                        </div>
                        <ReviewsSection prompt={selectedPrompt} onSaveReview={handleSaveReview} />
                      </div>
                      
                      {/* Right Sidebar Sandbox */}
                      <div className="w-full 2xl:w-[400px] shrink-0 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#111] shadow-sm flex flex-col mt-8 2xl:mt-0 2xl:sticky 2xl:top-0 2xl:h-[calc(100vh-140px)]">
                         <div className="p-4 border-b border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                           <Bot className="w-4 h-4 text-indigo-500" /> Chat Sandbox
                         </div>
                         <div className="flex-1 overflow-y-auto p-4">
                           <PromptTester prompt={selectedPrompt} />
                         </div>
                      </div>
                      
                    </div>
                  )}
                </div>
              ) : null}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
