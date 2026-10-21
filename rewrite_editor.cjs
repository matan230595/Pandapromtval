const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="max-w-4xl mx-auto space-y-6">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*\) : selectedPrompt \? \(/;

const newEditorLayout = `<div className="max-w-6xl mx-auto space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {editingPrompt?.id ? 'ערוך פרומפט' : 'פרומפט חדש'}
                    </h2>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setIsEditing(false); if(!editingPrompt?.id) setSelectedPromptId(null); }} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm">
                        ביטול
                      </button>
                      <button onClick={() => handleSave(editingPrompt || {})} className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm">
                        <Check className="w-4 h-4" /> שמור שינויים
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="xl:col-span-2 space-y-6">
                      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">כותרת הפרומפט</label>
                          <input
                            type="text"
                            value={editingPrompt?.title || ""}
                            onChange={(e) => setEditingPrompt({...editingPrompt, title: e.target.value})}
                            placeholder="לדוגמה: כתיבת פוסט ללינקדאין..."
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תיאור קצר</label>
                          <input
                            type="text"
                            value={editingPrompt?.description || ""}
                            onChange={(e) => setEditingPrompt({...editingPrompt, description: e.target.value})}
                            placeholder="תיאור קצר של מטרת הפרומפט..."
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-slate-600 dark:text-slate-300"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תוכן הפרומפט</label>
                            <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50">
                              {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              שפר בעזרת AI
                            </button>
                          </div>
                          <div className="relative">
                            <textarea
                              value={editingPrompt?.content || ""}
                              onChange={handleContentChange}
                              placeholder="הכנס את הפרומפט שלך כאן..."
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono text-slate-800 dark:text-slate-200 resize-y min-h-[250px] leading-relaxed"
                              dir="auto"
                            />
                            <div className="absolute bottom-3 left-3 text-[10px] font-bold text-slate-400 bg-white/80 dark:bg-black/80 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                              ~{Math.ceil((editingPrompt?.content?.length || 0) / 3.5)} טוקנים
                            </div>
                            {varSuggest.show && (
                              <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                                <div className="p-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">משתנים נפוצים</div>
                                {COMMON_VARS.filter(v => v.name.includes(varSuggest.filter)).map(v => (
                                  <button
                                    key={v.name}
                                    onClick={() => handleVarSelect(v.name)}
                                    className="w-full text-right px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300 transition-colors"
                                  >
                                    <div className="font-bold">{v.name}</div>
                                    <div className="text-[10px] text-slate-500">{v.desc}</div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {checkPromptValidation(editingPrompt?.content || '') && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 rounded-xl flex items-start gap-2 text-amber-700 dark:text-amber-400 text-xs mt-3">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{checkPromptValidation(editingPrompt?.content || '')}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פלט לדוגמה (Preview Output)</label>
                          <textarea
                            value={editingPrompt?.exampleOutput || ""}
                            onChange={(e) => setEditingPrompt({...editingPrompt, exampleOutput: e.target.value})}
                            placeholder="הוסף דוגמה של הפלט שהפרומפט הזה מייצר..."
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono text-slate-800 dark:text-slate-200 resize-y min-h-[120px]"
                            dir="auto"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                              תיקייה
                              {folders.length === 0 && (
                                <button type="button" onClick={() => setIsNewFolderModalOpen(true)} className="ml-2 text-indigo-500 hover:text-indigo-600">
                                  + צור תיקייה
                                </button>
                              )}
                            </label>
                          </div>
                          <select 
                            value={editingPrompt?.folder || (folders.length > 0 ? folders[0].id : '')}
                            onChange={e => setEditingPrompt({...editingPrompt, folder: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold text-slate-900 dark:text-white"
                          >
                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">נושא (Topic)</label>
                          <select 
                            value={editingPrompt?.topic || "General"}
                            onChange={e => setEditingPrompt({...editingPrompt, topic: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold text-slate-900 dark:text-white"
                          >
                            {['General', 'Finance', 'Tech', 'Marketing', 'Sales', 'HR', 'Creative', 'Academic', 'Writing', 'SEO', 'Coding'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תגיות</label>
                          <TagCombobox 
                            tags={editingPrompt?.tags || []}
                            allTags={allTags}
                            onChange={(tags) => setEditingPrompt({...editingPrompt, tags})}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תאריך יעד</label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              value={editingPrompt?.dueDate || ""}
                              onChange={(e) => setEditingPrompt({...editingPrompt, dueDate: e.target.value})}
                              className="w-full ps-9 pe-4 py-2 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedPrompt ? (`;

if (code.match(regex)) {
    code = code.replace(regex, newEditorLayout);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Editor layout rewritten to Bento style.");
} else {
    console.log("Regex did not match.");
}
