const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add FewShot Examples Editor UI
const fewShotUI = `
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" /> דוגמאות Few-Shot
                            </label>
                            <button 
                              onClick={() => {
                                const newExample = { id: crypto.randomUUID?.() || Math.random().toString(), input: '', output: '', isActive: true };
                                setEditingPrompt({...editingPrompt, fewShotExamples: [...(editingPrompt?.fewShotExamples || []), newExample]});
                              }}
                              className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> הוסף דוגמה
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(editingPrompt?.fewShotExamples || []).map((example, i) => (
                              <div key={example.id} className={\`p-3 rounded-xl border \${example.isActive ? 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10' : 'bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5 opacity-70'}\`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={example.isActive} onChange={(e) => {
                                      const newEx = [...(editingPrompt.fewShotExamples || [])];
                                      newEx[i].isActive = e.target.checked;
                                      setEditingPrompt({...editingPrompt, fewShotExamples: newEx});
                                    }} className="rounded text-blue-500 focus:ring-blue-500/30" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">דוגמה {i + 1}</span>
                                  </div>
                                  <button onClick={() => {
                                    const newEx = editingPrompt.fewShotExamples.filter((_, idx) => idx !== i);
                                    setEditingPrompt({...editingPrompt, fewShotExamples: newEx});
                                  }} className="text-red-400 hover:text-red-500">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] text-slate-500 font-bold mb-1 block">קלט (Input)</label>
                                    <textarea value={example.input} onChange={(e) => {
                                      const newEx = [...(editingPrompt.fewShotExamples || [])];
                                      newEx[i].input = e.target.value;
                                      setEditingPrompt({...editingPrompt, fewShotExamples: newEx});
                                    }} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500" rows={2} dir="auto" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-500 font-bold mb-1 block">פלט (Output)</label>
                                    <textarea value={example.output} onChange={(e) => {
                                      const newEx = [...(editingPrompt.fewShotExamples || [])];
                                      newEx[i].output = e.target.value;
                                      setEditingPrompt({...editingPrompt, fewShotExamples: newEx});
                                    }} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500" rows={2} dir="auto" />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(!editingPrompt?.fewShotExamples || editingPrompt.fewShotExamples.length === 0) && (
                              <div className="text-xs text-center text-slate-400 dark:text-slate-500 py-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                                אין דוגמאות Few-Shot. הוסף דוגמאות כדי לעזור ל-AI להבין את התבנית הרצויה.
                              </div>
                            )}
                          </div>
                        </div>
`;

code = code.replace(
  '                        </div>\n                      </div>\n                    </div>\n\n                    {/* Sidebar Column */}',
  '                        </div>\n' + fewShotUI + '\n                      </div>\n                    </div>\n\n                    {/* Sidebar Column */}'
);

// 2. Add Prompt Chaining Editor UI
const chainingUI = `
                        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Link2 className="w-3.5 h-3.5" /> שרשור פרומפטים (Chaining)
                          </label>
                          <select
                            value={editingPrompt?.chainNextPromptId || ""}
                            onChange={(e) => setEditingPrompt({ ...editingPrompt, chainNextPromptId: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium text-slate-800 dark:text-slate-200 appearance-none"
                            dir="rtl"
                          >
                            <option value="">ללא שרשור (עצור כאן)</option>
                            {prompts.filter(p => p.id !== editingPrompt?.id).map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                          <p className="text-[10px] text-slate-400 mt-1">
                            בחר פרומפט שיקבל את הפלט של פרומפט זה באופן אוטומטי במצב Playground.
                          </p>
                        </div>
`;

code = code.replace(
  '                            <option value="he">עברית</option>\n                            <option value="en">English</option>\n                          </select>\n                        </div>',
  '                            <option value="he">עברית</option>\n                            <option value="en">English</option>\n                          </select>\n                        </div>\n' + chainingUI
);


fs.writeFileSync('src/App.tsx', code);
