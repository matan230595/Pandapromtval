const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the native select for tags with the advanced search UI
const tagFilterSelect = /<select\s+value=\{tagFilter\}\s+onChange=\{[^{]+\{[\s\S]+?\}\}\s+className="[^"]+">[\s\S]+?<\/select>/;

const advancedSearchUI = `
                  <div className="relative flex items-center gap-2">
                    <TagCombobox 
                      tags={Array.from(new Set(prompts.flatMap(p => p.tags || [])))} 
                      selectedTag={tagFilter} 
                      onSelectTag={setTagFilter} 
                    />
                    <div className="relative">
                      <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="h-[42px] px-4 glass-panel border border-slate-200/50 dark:border-white/10 rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm shadow-sm"
                      >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">מיון מתקדם</span>
                        {sortOrder !== 'recent' && <span className="w-2 h-2 rounded-full bg-blue-500 mr-1 animate-pulse" />}
                      </button>
                      {showFilters && (
                        <div className="absolute left-0 top-full mt-2 w-48 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[60]">
                          <div className="text-xs font-bold text-slate-400 mb-2 px-3 py-1 uppercase tracking-wider">סדר הצגה</div>
                          <button onClick={() => { setSortOrder('recent'); setShowFilters(false); }} className={\`w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 \${sortOrder === 'recent' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}\`}>עדכון אחרון (ברירת מחדל)</button>
                          <button onClick={() => { setSortOrder('created'); setShowFilters(false); }} className={\`w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 \${sortOrder === 'created' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}\`}>תאריך יצירה</button>
                          <button onClick={() => { setSortOrder('popular'); setShowFilters(false); }} className={\`w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 \${sortOrder === 'popular' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}\`}>הכי שמיש (פופולריות)</button>
                          <button onClick={() => { setSortOrder('custom'); setShowFilters(false); }} className={\`w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 \${sortOrder === 'custom' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}\`}>התאמה אישית (גרירה)</button>
                        </div>
                      )}
                    </div>
                  </div>
`;

code = code.replace(
  /<div className="flex items-center gap-2">\s*<div className="relative">\s*<Filter className="w-4 h-4 absolute start-3 top-1\/2 -translate-y-1\/2 text-slate-400" \/>\s*<select[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/g,
  advancedSearchUI
);

// Fallback if there are other selects
code = code.replace(
  /<div className="flex items-center gap-2">\s*<select[\s\S]*?<\/select>\s*<\/div>/g,
  advancedSearchUI
);

fs.writeFileSync('src/App.tsx', code);
