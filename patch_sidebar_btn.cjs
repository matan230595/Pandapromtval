const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `<div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('nav.communityAndTools')}</div>
            <button onClick={() => { setSelectedFolder("community"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${selectedFolder === "community" && currentView === "library" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>
              <Sparkles className="w-4 h-4" /> {t('nav.community')}
            </button>
          </div>`;

const addition = `<div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('nav.communityAndTools')}</div>
            <button onClick={() => { setSelectedFolder("community"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${selectedFolder === "community" && currentView === "library" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>
              <Sparkles className="w-4 h-4" /> {t('nav.community')}
            </button>
            <button onClick={() => { setIsFilterRulesModalOpen(true); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400\`}>
              <Filter className="w-4 h-4" /> כללי אוטומציה
            </button>
          </div>`;

code = code.replace(anchor, addition);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched sidebar button");
