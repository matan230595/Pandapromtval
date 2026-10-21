const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Need to track suggestedFolder
const stateHTML = `
  const [suggestedFolder, setSuggestedFolder] = useState<{id: string, name: string} | null>(null);
  
  useEffect(() => {
    if (isEditing && editingPrompt && !editingPrompt.folder && editingPrompt.content?.length > 30) {
      const timer = setTimeout(async () => {
         try {
           const key = localStorage.getItem("promptvault_gemini_key") || "";
           const res = await fetch("/api/gemini/suggest-folder", {
             method: "POST",
             headers: { "Content-Type": "application/json", ...(key ? { "x-gemini-api-key": key } : {}) },
             body: JSON.stringify({ 
               content: editingPrompt.content, 
               folders: folders.map(f => ({id: f.id, name: f.name})),
               promptsContext: prompts.slice(0, 10).map(p => ({title: p.title, folder: p.folder})) 
             })
           });
           const data = await res.json();
           if (data.folderId) {
             const f = folders.find(x => x.id === data.folderId);
             if (f) setSuggestedFolder({id: f.id, name: f.name});
           }
         } catch(e) {}
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setSuggestedFolder(null);
    }
  }, [editingPrompt?.content, isEditing]);
`;

code = code.replace(
  '  const [showInlineDiff, setShowInlineDiff] = useState(false);',
  '  const [showInlineDiff, setShowInlineDiff] = useState(false);\n' + stateHTML
);

// Render the suggestion button next to folder select
const suggestUI = `
                        {suggestedFolder && !editingPrompt?.folder && (
                          <button onClick={() => setEditingPrompt({...editingPrompt, folder: suggestedFolder.id})} className="text-xs text-indigo-500 hover:text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> הצעת AI: {suggestedFolder.name} (לחץ להחלה)
                          </button>
                        )}
`;

// we need to place it near the folder select in Editor
code = code.replace(
  '</select>\n                    </div>\n                    \n                    <div className="flex-1">',
  '</select>\n' + suggestUI + '\n                    </div>\n                    \n                    <div className="flex-1">'
);

fs.writeFileSync('src/App.tsx', code);
