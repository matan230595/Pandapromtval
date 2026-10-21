const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<div className="flex items-center gap-2">
                            <button onClick={(e) => handleQuickArchive(p.id, e)} className="text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors" title="העבר לארכיון">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => toggleFavorite(p.id, e)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Heart className={\`w-4 h-4 \${p.favorite ? "fill-red-500 text-red-500" : ""}\`} />
                            </button>
                          </div>`;

const replacement = `<div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedPromptId(p.id); setIsEditing(false); setTimeout(() => document.getElementById('start-test-btn')?.click(), 100); }} className="text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" title="בדיקה מהירה">
                              <Play className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => handleQuickArchive(p.id, e)} className="text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors" title="העבר לארכיון">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => toggleFavorite(p.id, e)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Heart className={\`w-4 h-4 \${p.favorite ? "fill-red-500 text-red-500" : ""}\`} />
                            </button>
                          </div>`;

code = code.replace(target, replacement);

const targetKanban = `<div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</h3>
                                    {p.isReadOnly && <Lock className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                                  </div>`;

const replaceKanban = `<div className="flex items-center justify-between mb-2 gap-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</h3>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button onClick={(e) => { e.stopPropagation(); setSelectedPromptId(p.id); setIsEditing(false); setTimeout(() => document.getElementById('start-test-btn')?.click(), 100); }} className="text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1" title="בדיקה מהירה">
                                        <Play className="w-3.5 h-3.5" />
                                      </button>
                                      {p.isReadOnly && <Lock className="w-3.5 h-3.5 text-red-500" />}
                                    </div>
                                  </div>`;

code = code.replace(targetKanban, replaceKanban);

// AI badge for grid view tags area
const tagsAreaTarget = `{p.tags?.slice(0, 2).map(t => (
                              <button`;
const tagsAreaReplacement = `{p.aiOptimized && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center gap-1 shadow-sm animate-pulse">
                                <Sparkles className="w-3 h-3" /> AI-Optimized
                              </span>
                            )}
                            {p.tags?.slice(0, 2).map(t => (
                              <button`;
code = code.replace(tagsAreaTarget, tagsAreaReplacement);

// AI badge for kanban view bottom area
const kanbanDateTarget = `<span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                                    {p.dueDate && <span className="bg-red-50 text-red-500 dark:bg-red-900/20 px-1.5 py-0.5 rounded font-medium">יעד: {new Date(p.dueDate).toLocaleDateString()}</span>}
                                  </div>`;
const kanbanDateReplacement = `<div className="flex items-center gap-1">
                                      {p.aiOptimized && <Sparkles className="w-3 h-3 text-indigo-500" title="AI-Optimized" />}
                                      <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    {p.dueDate && <span className="bg-red-50 text-red-500 dark:bg-red-900/20 px-1.5 py-0.5 rounded font-medium">יעד: {new Date(p.dueDate).toLocaleDateString()}</span>}
                                  </div>`;
code = code.replace(kanbanDateTarget, kanbanDateReplacement);

fs.writeFileSync('src/App.tsx', code);
