const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const additionalSidebarItems = `
            <button onClick={() => { setSelectedFolder("archive"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${selectedFolder === "archive" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>
              <Download className="w-4 h-4" /> ארכיון
            </button>
`;

code = code.replace(/<button onClick=\{\(\) => \{ setSelectedFolder\("favorites"\); setCurrentView\("library"\); setIsMobileMenuOpen\(false\); \}\} className=\{`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \$\{selectedFolder === "favorites" && currentView === "library" \? "bg-slate-100 dark:bg-white\/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white\/5 text-slate-600 dark:text-slate-400"}`\}\>\n\s*<Heart className="w-4 h-4" \/> מועדפים\n\s*<\/button>/, `$&` + additionalSidebarItems);


const communitySidebar = `
          <div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">קהילה וכלים</div>
            <button onClick={() => { setSelectedFolder("community"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${selectedFolder === "community" && currentView === "library" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>
              <Sparkles className="w-4 h-4" /> תבניות קהילה
            </button>
          </div>
`;
code = code.replace(/<div className="space-y-1">\n\s*<div className="flex items-center justify-between px-3 mb-2">\n\s*<div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">אוספים \(תיקיות\)/, communitySidebar + '\n$&');

fs.writeFileSync('src/App.tsx', code);
