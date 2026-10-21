const fs = require('fs');

let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add ArrowDownAZ and Clock icons to import if not present
code = code.replace(
  'Trash2, FolderDown, Edit3, Download, Play, MessageSquare, History, AlignLeft,',
  'Trash2, FolderDown, Edit3, Download, Play, MessageSquare, History, AlignLeft, ArrowDownAZ, Clock,'
);

// 2. Add state
code = code.replace(
  'const [appLanguage, setAppLanguage] = useState<Language>(() => {',
  'const [folderSortOrder, setFolderSortOrder] = useState<"alphabetical" | "recent">("alphabetical");\nconst [appLanguage, setAppLanguage] = useState<Language>(() => {'
);

// 3. Create sortedFolders variable
code = code.replace(
  'const filteredPrompts = useMemo(() => {',
  'const sortedFolders = useMemo(() => {\n    const sorted = [...folders];\n    if (folderSortOrder === "alphabetical") {\n      sorted.sort((a, b) => a.name.localeCompare(b.name, "he"));\n    } else {\n      // By recent: we can check the newest prompt in that folder\n      sorted.sort((a, b) => {\n        const aPrompts = prompts.filter(p => p.folder === a.id);\n        const bPrompts = prompts.filter(p => p.folder === b.id);\n        const aMax = Math.max(...aPrompts.map(p => new Date(p.updatedAt).getTime()), 0);\n        const bMax = Math.max(...bPrompts.map(p => new Date(p.updatedAt).getTime()), 0);\n        return bMax - aMax;\n      });\n    }\n    return sorted;\n  }, [folders, prompts, folderSortOrder]);\n\n  const filteredPrompts = useMemo(() => {'
);

// 4. Update rendering to use sortedFolders and add the button
code = code.replace(
  `              <button onClick={() => setIsNewFolderModalOpen(true)} className="text-slate-400 hover:text-blue-500 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {folders.map(f => (`,
  `              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFolderSortOrder(prev => prev === "alphabetical" ? "recent" : "alphabetical")}
                  className="text-slate-400 hover:text-blue-500 transition-colors"
                  title={folderSortOrder === "alphabetical" ? "מיין לפי אחרונים" : "מיין לפי א-ב"}
                >
                  {folderSortOrder === "alphabetical" ? <ArrowDownAZ className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsNewFolderModalOpen(true)} className="text-slate-400 hover:text-blue-500 transition-colors" title="תיקייה חדשה">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {sortedFolders.map(f => (`
);

fs.writeFileSync(path, code);
console.log("Patched folder sorting");
