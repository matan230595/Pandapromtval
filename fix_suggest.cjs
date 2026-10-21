const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Rename ML state and usages
code = code.replace(
  'const suggestedFolder = useMemo(() => {',
  'const [mlSuggestedFolder, setMlSuggestedFolder] = useState<{id: string, name: string} | null>(null);\n  const suggestedFolder = useMemo(() => {'
);

code = code.replace(
  'if (f) setSuggestedFolder({id: f.id, name: f.name});',
  'if (f) setMlSuggestedFolder({id: f.id, name: f.name});'
);

code = code.replace(
  'setSuggestedFolder(null);\n    }\n  }, [editingPrompt?.content, isEditing]);',
  'setMlSuggestedFolder(null);\n    }\n  }, [editingPrompt?.content, isEditing]);'
);

// 2. Add the UI for mlSuggestedFolder
const uiInsert = `
                        {mlSuggestedFolder && !editingPrompt?.folder && (
                          <div className="mt-1">
                            <button onClick={() => setEditingPrompt({...editingPrompt, folder: mlSuggestedFolder.id})} className="text-xs text-indigo-500 hover:text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> הצעת AI: {mlSuggestedFolder.name} (לחץ להחלה)
                            </button>
                          </div>
                        )}
`;

code = code.replace(
  '{folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}\n                          </select>\n                        </div>',
  '{folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}\n                          </select>' + uiInsert + '\n                        </div>'
);

fs.writeFileSync('src/App.tsx', code);
