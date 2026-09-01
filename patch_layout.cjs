const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLayout = `
                    ) : (
                      <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900/50 flex flex-col">
                        <div className="font-mono text-[15px] leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 flex-1" dir="auto" dangerouslySetInnerHTML={{ __html: Prism.highlight(selectedPrompt.content, Prism.languages.markdown, 'markdown') }} />
`;
const newLayout = `
                    ) : (
                      <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900/50 flex flex-col 2xl:flex-row gap-8">
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="font-mono text-[15px] leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 flex-1" dir="auto" dangerouslySetInnerHTML={{ __html: Prism.highlight(selectedPrompt.content, Prism.languages.markdown, 'markdown') }} />
`;
code = code.replace(oldLayout, newLayout);

const oldTester = `
                        )}
                        <PromptTester prompt={selectedPrompt} />
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
`;
const newTester = `
                        )}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
`;
code = code.replace(oldTester, newTester);

const oldNotes = `
                        </div>
                          <ReviewsSection prompt={selectedPrompt} onSaveReview={handleSaveReview} />
                        </div>
                      )}
`;
const newNotes = `
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
`;
code = code.replace(oldNotes, newNotes);

fs.writeFileSync('src/App.tsx', code);
