const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">[\s\S]*?<\/h2>\s*<\/div>\s*<\/div>/;
const replacement = `<h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {selectedFolder === "all" ? "כל הפרומפטים" : selectedFolder === "favorites" ? "מועדפים" : selectedFolder === "archive" ? "ארכיון" : selectedFolder === "community" ? "תבניות קהילה" : folders.find(f => f.id === selectedFolder)?.name || "ספריה"}
                      </h2>
                    </div>
                    {selectedFolder !== "community" && (
                      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                        <button title="תצוגת גריד" onClick={() => setViewMode('grid')} className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'grid' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}><LayoutGrid className="w-4 h-4" /></button>
                        <button title="תצוגת רשימה" onClick={() => setViewMode('list')} className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'list' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}><List className="w-4 h-4" /></button>
                        <button title="לוח קאנבן" onClick={() => setViewMode('kanban')} className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'kanban' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}><Kanban className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
