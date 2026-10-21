const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /(<button onClick=\{\(\) => \{ setSortOrder\('custom'\); setShowFilters\(false\); \}\} className=\{`[^`]+`\}>התאמה אישית \(גרירה\)<\/button>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>)\s*(<div>\s*<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">נושא \(Topic\)<\/label>)/;

const restoreBlock = `
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-[#0a0a0a]">
                {filteredPrompts.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    לא נמצאו פרומפטים.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredPrompts.map((p, idx) => (
                      <div 
                        key={p.id}
                        draggable={true}
                        onDragStart={() => setDraggedPromptId(p.id)}
                        onDragOver={(e) => handlePromptDragOver(e, p.id)}
                        onDrop={(e) => handlePromptDrop(e, p.id)}
                        onClick={() => { setSelectedPromptId(p.id); setIsEditing(false); }}
                        className={\`group p-4 bg-white dark:bg-[#1a1a1a] border rounded-2xl cursor-pointer transition-all duration-200 \${selectedPromptId === p.id ? 'border-blue-500 ring-2 ring-blue-500/20' : dragOverPromptId === p.id ? 'border-blue-400 border-dashed scale-[1.02]' : 'border-slate-200 dark:border-white/10 hover:border-blue-300 hover:shadow-md'}\`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</h3>
                          <div className="flex items-center gap-1">
                            {p.isAIOptimized && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI
                              </span>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleQuickTest(p); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Quick Test">
                              <Play className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{p.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {p.tags?.slice(0, 3).map(t => (
                            <span key={t} className="px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-md text-[10px]">{t}</span>
                          ))}
                          {p.tags && p.tags.length > 3 && (
                            <span className="px-2 py-1 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-md text-[10px]">+{p.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            {isEditing ? (
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0a]">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {editingPrompt?.id ? 'ערוך פרומפט' : 'פרומפט חדש'}
                        </h2>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">כותרת הפרומפט</label>
                        <input
                          type="text"
                          value={editingPrompt?.title || ""}
                          onChange={(e) => setEditingPrompt({...editingPrompt, title: e.target.value})}
                          placeholder="לדוגמה: כתיבת פוסט ללינקדאין..."
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תיאור קצר</label>
                        <input
                          type="text"
                          value={editingPrompt?.description || ""}
                          onChange={(e) => setEditingPrompt({...editingPrompt, description: e.target.value})}
                          placeholder="תיאור קצר של מטרת הפרומפט..."
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-600 dark:text-slate-300"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
`;

if (regex.test(code)) {
  code = code.replace(regex, `$1\n${restoreBlock}\n$2`);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully restored the missing code.");
} else {
  console.log("Regex did not match!");
}
