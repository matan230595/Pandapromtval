const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tagsHTML = `
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תגיות</label>
                            <button 
                              type="button"
                              onClick={() => {
                                if (editingPrompt?.content) {
                                  // Call handleAutoTag directly if it's available, or just fetch the classification
                                  fetch('/api/gemini/classify', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ content: editingPrompt.content, existingTags: allTags })
                                  }).then(r => r.json()).then(data => {
                                    if (data.tags) {
                                      setEditingPrompt({...editingPrompt, tags: [...new Set([...(editingPrompt.tags || []), ...data.tags])]});
                                    }
                                  }).catch(() => {});
                                }
                              }}
                              className="text-xs flex items-center gap-1 text-indigo-500 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md transition-colors"
                            >
                              <Sparkles className="w-3 h-3" /> תיוג אוטומטי
                            </button>
                          </div>
                          <TagCombobox 
                            tags={editingPrompt?.tags || []}
                            allTags={allTags}
                            onChange={(tags) => setEditingPrompt({...editingPrompt, tags})}
                          />
                        </div>
`;

code = code.replace(
  '                        <div>\n                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תגיות</label>\n                          <TagCombobox \n                            tags={editingPrompt?.tags || []}\n                            allTags={allTags}\n                            onChange={(tags) => setEditingPrompt({...editingPrompt, tags})}\n                          />\n                        </div>',
  tagsHTML
);

fs.writeFileSync('src/App.tsx', code);
