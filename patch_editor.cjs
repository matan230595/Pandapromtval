const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexEditorGrid = /<div className="grid grid-cols-2 gap-4">\s*<div>\s*<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פלטפורמה מומלצת<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>\s*<div>[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;

const replacementGrid = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פלטפורמה מומלצת</label>
                            <select 
                              value={editingPrompt?.platform || "General"}
                              onChange={e => setEditingPrompt({...editingPrompt, platform: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                            >
                              {Object.keys(PLATFORMS).map(k => <option key={k} value={k}>{PLATFORMS[k].name}</option>)}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">נושא (Topic)</label>
                            <select 
                              value={editingPrompt?.topic || "General"}
                              onChange={e => setEditingPrompt({...editingPrompt, topic: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                            >
                              {['General', 'Finance', 'Tech', 'Marketing', 'Sales', 'HR', 'Creative', 'Academic', 'Writing', 'SEO', 'Coding'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                                תיקייה
                                {folders.length === 0 && (
                                  <button type="button" onClick={() => setIsNewFolderModalOpen(true)} className="ml-2 text-blue-500 hover:text-blue-600">
                                    + צור תיקייה
                                  </button>
                                )}
                              </label>
                            </div>
                            <select 
                              value={editingPrompt?.folder || (folders.length > 0 ? folders[0].id : '')}
                              onChange={e => setEditingPrompt({...editingPrompt, folder: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                            >
                              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                          </div>
                        </div>`;

code = code.replace(regexEditorGrid, replacementGrid);

fs.writeFileSync('src/App.tsx', code);
