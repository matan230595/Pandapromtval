const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add new state for recent searches, search focus, and advanced sorting/filtering
code = code.replace(
  'const [sortOrder, setSortOrder] = useState<"recent" | "alpha" | "created">("recent");',
  `const [sortOrder, setSortOrder] = useState<"recent" | "alpha" | "created" | "popular" | "custom">("recent");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } catch(e) { return []; }
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);`
);

// 2. Add handleSearchSubmit and update localStorage
const handleSearchSubmit = `
  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    setSearchQuery(query);
    setIsSearchFocused(false);
  };
`;
code = code.replace(
  '  const filteredPrompts = useMemo(',
  handleSearchSubmit + '\n  const filteredPrompts = useMemo('
);

// 3. Update filteredPrompts sorting logic
code = code.replace(
  'return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());',
  `return list.sort((a, b) => {
      if (sortOrder === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortOrder === "created") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === "popular") return (b.useCount || 0) - (a.useCount || 0);
      if (sortOrder === "alpha") return a.title.localeCompare(b.title);
      if (sortOrder === "custom") return (a.sortIndex || 0) - (b.sortIndex || 0);
      return 0;
    });`
);
code = code.replace(
  '}, [prompts, selectedFolder, searchQuery, tagFilter]);',
  '}, [prompts, selectedFolder, searchQuery, tagFilter, sortOrder]);'
);

// 4. Update Search Input UI and Add Dropdown
const searchUIOriginal = `<div className="relative flex-1">
                    <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חיפוש חופשי..."
                      className="w-full ps-10 pe-12 py-2.5 bg-white dark:bg-[#111] border border-slate-200/60 dark:border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all focus:shadow-md"
                    />
                    <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 pointer-events-none text-slate-400">
                      <Command className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">K</span>
                    </div>
                  </div>`;

const searchUINew = `<div className="relative flex-1">
                    <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchSubmit(searchQuery);
                        }
                      }}
                      placeholder="חיפוש חופשי..."
                      className="w-full ps-10 pe-12 py-2.5 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all focus:shadow-md focus:bg-white dark:focus:bg-[#111]"
                    />
                    <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 pointer-events-none text-slate-400">
                      <Command className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">K</span>
                    </div>
                    {isSearchFocused && recentSearches.length > 0 && (
                      <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50">
                        <div className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-white/5">חיפושים אחרונים</div>
                        {recentSearches.map((search, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleSearchSubmit(search)}
                            className="px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <History className="w-4 h-4 text-slate-400" />
                            {search}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>`;

code = code.replace(searchUIOriginal, searchUINew);

// 5. Add Advanced Search Filters UI next to TagCombobox
const advancedSearchUI = `
                  <TagCombobox 
                    tags={Array.from(new Set(prompts.flatMap(p => p.tags || [])))} 
                    selectedTag={tagFilter} 
                    onSelectTag={setTagFilter} 
                  />
                  <div className="relative">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="h-10 px-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      <Filter className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">מיון וסינון</span>
                    </button>
                    {showFilters && (
                      <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-2 z-50">
                        <div className="text-xs font-bold text-slate-500 mb-2 px-2">מיין לפי</div>
                        <button onClick={() => { setSortOrder('recent'); setShowFilters(false); }} className={\`w-full text-right px-3 py-2 rounded-xl text-sm transition-colors \${sortOrder === 'recent' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}\`}>עדכון אחרון</button>
                        <button onClick={() => { setSortOrder('created'); setShowFilters(false); }} className={\`w-full text-right px-3 py-2 rounded-xl text-sm transition-colors \${sortOrder === 'created' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}\`}>תאריך יצירה</button>
                        <button onClick={() => { setSortOrder('popular'); setShowFilters(false); }} className={\`w-full text-right px-3 py-2 rounded-xl text-sm transition-colors \${sortOrder === 'popular' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}\`}>הכי פופולרי</button>
                        <button onClick={() => { setSortOrder('custom'); setShowFilters(false); }} className={\`w-full text-right px-3 py-2 rounded-xl text-sm transition-colors \${sortOrder === 'custom' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}\`}>התאמה אישית</button>
                      </div>
                    )}
                  </div>`;
                  
code = code.replace(
  `<TagCombobox \n                    tags={Array.from(new Set(prompts.flatMap(p => p.tags || [])))} \n                    selectedTag={tagFilter} \n                    onSelectTag={setTagFilter} \n                  />`,
  advancedSearchUI
);

// Fallback replace for TagCombobox if exact format above doesn't match
code = code.replace(
  /<TagCombobox[\s\S]*?onSelectTag={setTagFilter}[\s\S]*?\/>/,
  advancedSearchUI
);

fs.writeFileSync('src/App.tsx', code);
