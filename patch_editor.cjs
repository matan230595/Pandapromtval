const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const magicState = `const [isMagicSuggesting, setIsMagicSuggesting] = useState(false);
  const [magicSuggestions, setMagicSuggestions] = useState<any>(null);`;

code = code.replace(
  'const [isReadingMode, setIsReadingMode] = useState(false);',
  'const [isReadingMode, setIsReadingMode] = useState(false);\n  ' + magicState
);

const magicFunction = `
  const handleMagicSuggest = async () => {
    if (!editingPrompt.content?.trim()) return;
    setIsMagicSuggesting(true);
    try {
      const res = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingPrompt.content, language: isRtl(editingPrompt.content || '') ? 'he' : 'en' })
      });
      if (res.ok) {
        const data = await res.json();
        setMagicSuggestions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMagicSuggesting(false);
    }
  };
`;

code = code.replace(
  'const handleSemanticSearch',
  magicFunction + '\n  const handleSemanticSearch'
);

const editorTools = `
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={handleMagicSuggest} disabled={isMagicSuggesting || !editingPrompt.content?.trim()} className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all flex items-center gap-1 disabled:opacity-50">
                      {isMagicSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      {isMagicSuggesting ? 'מנתח...' : 'שפר פרומפט (Magic)'}
                    </button>
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" />
                      ~{Math.ceil((editingPrompt.content || '').length / 4)} טוקנים
                    </div>
                  </div>
                  {magicSuggestions && (
                    <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> תובנות AI:
                        </h4>
                        <button onClick={() => setMagicSuggestions(null)} className="text-purple-400 hover:text-purple-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {magicSuggestions.missingRole && (
                        <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">
                          <strong>תפקיד חסר:</strong> {magicSuggestions.missingRole}
                        </p>
                      )}
                      {magicSuggestions.suggestedVariables?.length > 0 && (
                        <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">
                          <strong>משתנים שכדאי להוסיף:</strong> {magicSuggestions.suggestedVariables.map((v:string) => \`$(\${v})\`).join(', ')}
                        </p>
                      )}
                      {magicSuggestions.improvements?.length > 0 && (
                        <ul className="text-xs text-purple-700 dark:text-purple-400 list-disc list-inside">
                          {magicSuggestions.improvements.map((imp:string, i:number) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
`;

code = code.replace(
  '<label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">תוכן הפרומפט</label>',
  '<label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">תוכן הפרומפט</label>\n' + editorTools
);

fs.writeFileSync('src/App.tsx', code);
