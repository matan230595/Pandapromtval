const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div id="prompts-grid" className=\{!selectedPromptId && !isEditing \? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start \[perspective:1000px\]" : "space-y-2"\}\>([\s\S]*?)<\/AnimatePresence>\s*<\/div>/;

const replacement = `{(!selectedPromptId && !isEditing && viewMode === 'kanban') ? (
                  <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start" style={{minHeight: '400px'}}>
                    {folders.map(folder => {
                      const folderPrompts = filteredPrompts.filter(p => p.folder === folder.id);
                      return (
                        <div key={folder.id} className="w-80 shrink-0 bg-slate-100 dark:bg-white/5 rounded-2xl flex flex-col max-h-full" onDragOver={(e) => handleDragOver(e, folder.id)} onDragLeave={handleDragLeave} onDrop={(e) => handleDropToFolder(e, folder.id)}>
                          <div className={\`p-4 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-white/10 \${dragOverFolderId === folder.id ? 'bg-blue-100 dark:bg-blue-900/40' : ''} rounded-t-2xl\`}>
                            <div className="flex items-center gap-2">
                              {folder.icon ? <span>{folder.icon}</span> : <FolderIcon className="w-4 h-4 opacity-70" />}
                              {folder.name}
                            </div>
                            <span className="bg-slate-200 dark:bg-white/10 text-xs px-2 py-1 rounded-full">{folderPrompts.length}</span>
                          </div>
                          <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-3">
                            <AnimatePresence mode="popLayout">
                              {folderPrompts.map(p => (
                                <motion.div 
                                  layout
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  key={p.id}
                                  draggable={true}
                                  onDragStart={(e: React.DragEvent) => handleDragStart(e, p.id)}
                                  onClick={() => { setSelectedPromptId(p.id); setIsEditing(false); }}
                                  className={\`cursor-pointer rounded-xl border p-4 bg-white dark:bg-[#111] hover:-translate-y-1 hover:shadow-lg transition-all active:cursor-grabbing border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20\`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</h3>
                                    {p.isReadOnly && <Lock className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3" dir="auto">{p.content}</p>
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                                    {p.dueDate && <span className="bg-red-50 text-red-500 dark:bg-red-900/20 px-1.5 py-0.5 rounded font-medium">יעד: {new Date(p.dueDate).toLocaleDateString()}</span>}
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div id="prompts-grid" className={!selectedPromptId && !isEditing ? (viewMode === 'list' ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start [perspective:1000px]") : "space-y-2"}>
$1
                  </div>
                )}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
