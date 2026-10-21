const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will find `const filteredPrompts = useMemo(() => {`
// And manually rewrite the body of useMemo up to `}, [prompts, searchQuery, selectedFolder, tagFilter, semanticResults, folders, folderSortOrder]);` or whatever dependencies it has.

let startIdx = code.indexOf('const filteredPrompts = useMemo(() => {');
if (startIdx !== -1) {
  let endIdx = code.indexOf('}, [folders, prompts, folderSortOrder]);', startIdx);
  if (endIdx === -1) {
    // maybe the dependencies are different
    endIdx = code.indexOf('}, [', startIdx);
    endIdx = code.indexOf(']);', endIdx) + 3;
  }
  
  if (endIdx !== -1 && endIdx > startIdx) {
    const newBlock = `const filteredPrompts = useMemo(() => {
    let list = prompts;
    if (tagFilter !== 'all') {
      list = list.filter(p => p.tags && p.tags.includes(tagFilter));
    }
    
    if (semanticResults !== null) {
      const idMap = new Map();
      semanticResults.forEach((id, idx) => idMap.set(id, idx));
      list = list.filter(p => idMap.has(p.id))
                 .sort((a, b) => idMap.get(a.id) - idMap.get(b.id));
    } else if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.folder !== "community") && 
        ((p.title || "").toLowerCase().includes(q) || (p.content || "").toLowerCase().includes(q) || (p.tags && p.tags.some(t => (t || "").toLowerCase().includes(q))))
      );
    } else {
      if (selectedFolder === "favorites") {
        list = list.filter(p => p.favorite && p.folder !== "archive" && p.folder !== "community");
      } else if (selectedFolder === "recent") {
        list = [...list].filter(p => p.lastUsedAt).sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime());
      } else if (selectedFolder === "archive") {
        list = list.filter(p => p.folder === "archive");
      } else if (selectedFolder === "community") {
        list = list.filter(p => p.folder === "community");
      } else if (selectedFolder !== "all") {
        list = list.filter(p => p.folder === selectedFolder);
      } else {
        list = list.filter(p => p.folder !== "archive" && p.folder !== "community");
      }
    }
    
    if (semanticResults === null && selectedFolder !== "recent") {
      let sorted = [...list];
      if (folderSortOrder === 'alpha') {
        sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      } else if (folderSortOrder === 'custom') {
        sorted.sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0));
      } else if (folderSortOrder === 'uses') {
        sorted.sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
      } else if (folderSortOrder === 'date') {
        sorted.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      }
      return sorted;
    }
    
    return list;
  }, [folders, prompts, folderSortOrder, searchQuery, tagFilter, selectedFolder, semanticResults]);`;

    code = code.substring(0, startIdx) + newBlock + code.substring(endIdx);
  }
}

// Add Magic Search Button to the search bar
const searchBarRegex = /<input\s+type="text"\s+placeholder="חיפוש..."\s+value=\{searchQuery\}\s+onChange=\{.*?\}\s+className=".*?"\s+\/>/s;
const magicSearchButton = `
  <div className="relative w-full max-w-2xl">
    <input 
      type="text" 
      placeholder="חיפוש חופשי (מילות מפתח)..." 
      value={searchQuery} 
      onChange={(e) => {
        setSearchQuery(e.target.value);
        if (e.target.value === "") setSemanticResults(null);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSemanticSearch();
        }
      }}
      className="w-full pl-36 pr-10 py-2.5 bg-slate-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#1a1a1a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
    />
    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    <button 
      onClick={handleSemanticSearch}
      disabled={isSemanticSearching || !searchQuery.trim()}
      className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-1"
    >
      {isSemanticSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      חיפוש סמנטי
    </button>
  </div>
`;

code = code.replace(/<div className="relative flex-1 max-w-2xl">.*?<\/div>/s, magicSearchButton);

fs.writeFileSync('src/App.tsx', code);
