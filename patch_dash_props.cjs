const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
let dashCode = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

appCode = appCode.replace(
  'onNavigateToLibrary={() => setCurrentView("library")}',
  'onNavigateToLibrary={(folderId) => { if (folderId) setSelectedFolder(folderId); setCurrentView("library"); }}'
);

dashCode = dashCode.replace(
  'onNavigateToLibrary: () => void;',
  'onNavigateToLibrary: (folderId?: string) => void;'
);

const miniStatsHTML = `
      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'סה״כ פרומפטים', value: prompts.length, icon: Terminal, colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', action: () => onNavigateToLibrary("all") },
          { label: 'סך שימושים', value: totalUses, icon: Activity, colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20', action: () => onNavigateToLibrary("all") /* we can also set view to insights but navigating to library is fine */ },
          { label: 'מועדפים', value: favoritePrompts.length, icon: Heart, colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20', action: () => onNavigateToLibrary("favorites") },
          { label: 'זמן שנחסך', value: timeSaved, icon: Zap, colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', action: () => onNavigateToLibrary("all") },
        ].map((stat, idx) => (
          <motion.button 
            onClick={stat.action}
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="text-right bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all group"
          >
            <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center \${stat.colorClass} shadow-inner group-hover:scale-110 transition-transform\`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.button>
        ))}
      </div>
`;

dashCode = dashCode.replace(
  /<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">[\s\S]*?<\/div>\n      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">/,
  miniStatsHTML + '\n      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">'
);

fs.writeFileSync('src/App.tsx', appCode);
fs.writeFileSync('src/components/DashboardView.tsx', dashCode);
