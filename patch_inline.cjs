const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const inlineState = `
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState<string>('');
  const [isSavingInline, setIsSavingInline] = useState(false);

  const handleInlineSave = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inlineEditValue.trim() || isSavingInline) {
      setInlineEditingId(null);
      return;
    }
    
    setIsSavingInline(true);
    if (user) {
      await updateDoc(doc(db, "users", user.uid, "prompts", id), {
        title: inlineEditValue.trim()
      });
      showToast('שם הפרומפט שונה בהצלחה', 'success');
    } else {
      const updated = prompts.map(p => p.id === id ? {...p, title: inlineEditValue.trim()} : p);
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    setIsSavingInline(false);
    setInlineEditingId(null);
  };
`;

code = code.replace('  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);', '  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);\n' + inlineState);

const oldTitleLine = '<h3 className={`font-bold truncate text-slate-900 dark:text-white pr-2 ${!selectedPromptId && !isEditing ? \'text-lg\' : \'text-sm\'}`}>{p.title}</h3>';

const newTitleLine = `
                          {inlineEditingId === p.id ? (
                            <form 
                              onSubmit={(e) => handleInlineSave(p.id, e)}
                              className="flex items-center gap-1 w-full mr-2"
                              onClick={e => e.stopPropagation()}
                            >
                              <input
                                autoFocus
                                value={inlineEditValue}
                                onChange={e => setInlineEditValue(e.target.value)}
                                className="flex-1 min-w-0 bg-white dark:bg-[#222] border border-blue-400 rounded px-2 py-1 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setInlineEditingId(null);
                                }}
                              />
                              {isSavingInline ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                              ) : (
                                <>
                                  <button type="submit" className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded p-1 transition-colors shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" onClick={() => setInlineEditingId(null)} className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded p-1 transition-colors shrink-0">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </form>
                          ) : (
                            <div className="flex items-center gap-1 min-w-0 flex-1 group">
                              <h3 className={\`font-bold truncate text-slate-900 dark:text-white pr-2 \${!selectedPromptId && !isEditing ? 'text-lg' : 'text-sm'}\`}>{p.title}</h3>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInlineEditValue(p.title);
                                  setInlineEditingId(p.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded shrink-0 focus:opacity-100"
                                aria-label="ערוך שם"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
`;

code = code.replace(oldTitleLine, newTitleLine);

fs.writeFileSync('src/App.tsx', code);
