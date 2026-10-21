const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /                    \{selectedFolder !== "community" && \([\s\S]*?<div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-\[\#0a0a0a\]">/;

const newHeader = `                    {selectedFolder !== "community" && (
                      <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                          <button title="תצוגת גריד" onClick={() => setViewMode('grid')} className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'grid' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}><LayoutGrid className="w-4 h-4" /></button>
                          <button title="תצוגת רשימה" onClick={() => setViewMode('list')} className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'list' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}><List className="w-4 h-4" /></button>
                          <button title="לוח קאנבן" onClick={() => setViewMode('kanban')} className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'kanban' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}><Kanban className="w-4 h-4" /></button>
                        </div>
                        <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
                          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Search & Filters */}
                <div className="flex flex-col gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="חפש פרומפטים..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchSubmit(searchQuery);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl ps-10 pe-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                    />
                    {isSearchFocused && recentSearches.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-[70] overflow-hidden">
                        <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-[#111]">חיפושים אחרונים</div>
                        {recentSearches.map((search, idx) => (
                          <div 
                            key={idx} 
                            className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 border-t border-slate-100 dark:border-white/5 text-sm"
                            onMouseDown={() => {
                              setSearchQuery(search);
                              setIsSearchFocused(false);
                            }}
                          >
                            <Search className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300">{search}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative flex items-center gap-2">
                    <TagCombobox 
                      tags={Array.from(new Set(prompts.flatMap(p => p.tags || [])))} 
                      selectedTag={tagFilter} 
                      onSelectTag={setTagFilter} 
                    />
                    <div className="relative">
                      <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={\`p-2.5 rounded-xl border flex items-center justify-center transition-colors \${showFilters || sortOrder !== 'recent' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}\`}
                      >
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline mr-2 text-sm font-medium">מיון מתקדם</span>
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
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-[#0a0a0a]">`;

if (regex.test(code)) {
  code = code.replace(regex, newHeader);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully patched header!");
} else {
  console.log("Regex did not match!");
}
