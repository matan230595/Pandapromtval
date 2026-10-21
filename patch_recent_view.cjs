const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const recentBtn = `            <button onClick={() => { setSelectedFolder("recent"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${selectedFolder === "recent" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>
              <Clock className="w-4 h-4" /> בשימוש לאחרונה
            </button>`;

code = code.replace(
  '<button onClick={() => { setSelectedFolder("favorites");',
  recentBtn + '\n            <button onClick={() => { setSelectedFolder("favorites");'
);

// update filteredPrompts
const recentLogic = `
  const filteredPrompts = useMemo(() => {
    let result = prompts;
    if (selectedFolder === "favorites") result = result.filter(p => p.favorite);
    else if (selectedFolder === "archive") result = result.filter(p => false); // Archive logic
    else if (selectedFolder === "community") result = []; // handled by view
    else if (selectedFolder === "recent") {
      result = [...result].filter(p => p.lastUsedAt).sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime());
    }
    else if (selectedFolder !== "all") result = result.filter(p => p.folder === selectedFolder);
`;

code = code.replace(
  /const filteredPrompts = useMemo\(\(\) => \{\n\s*let result = prompts;\n\s*if \(selectedFolder === "favorites"\) result = result\.filter\(p => p\.favorite\);\n\s*else if \(selectedFolder === "archive"\) result = result\.filter\(p => false\);\n\s*else if \(selectedFolder === "community"\) result = \[\];\n\s*else if \(selectedFolder !== "all"\) result = result\.filter\(p => p\.folder === selectedFolder\);/,
  recentLogic.trim()
);

fs.writeFileSync(path, code);
console.log("Patched recent view");
