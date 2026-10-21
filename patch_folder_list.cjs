const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const updatedFolderBtn = `
              <button 
                key={f.id}
                onClick={() => { setSelectedFolder(f.id); setCurrentView("library"); setIsMobileMenuOpen(false); }}
                onDragOver={(e) => handleDragOver(e, f.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropToFolder(e, f.id)}
                className={\`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors \${dragOverFolderId === f.id ? "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500 text-blue-700 dark:text-blue-300 shadow-sm" : selectedFolder === f.id && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}
              >
                <div className="flex items-center gap-3">
                  <FolderIcon className="w-4 h-4 shrink-0" style={{ color: f.color || 'currentColor', opacity: f.color ? 1 : 0.7 }} /> 
                  <span className="truncate">{f.name}</span>
                </div>
                {f.sharedWith && f.sharedWith.length > 0 && <Users className="w-3.5 h-3.5 opacity-50 shrink-0" />}
              </button>
`;

code = code.replace(
  /<button\s+key=\{f\.id\}[\s\S]*?<FolderIcon[\s\S]*?<\/button>/,
  updatedFolderBtn
);

fs.writeFileSync('src/App.tsx', code);
