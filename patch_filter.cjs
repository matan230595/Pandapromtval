const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const filterHTML = `
                  <div className="flex items-center gap-2">
                    <select
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 py-2 px-3 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <option value="all">כל התגיות</option>
                      {allTags.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
`;

code = code.replace(/<div className="flex items-center gap-2">/, filterHTML);

// Update filteredPrompts logic
const filterLogic = `
  const filteredPrompts = useMemo(() => {
    let list = prompts;
    if (activeFolder === "favorites") {
      list = list.filter((p) => p.favorite);
    } else if (activeFolder) {
      list = list.filter((p) => p.folder === activeFolder);
    }
    
    if (tagFilter && tagFilter !== 'all') {
      list = list.filter(p => p.tags && p.tags.includes(tagFilter));
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
`;
code = code.replace(/const filteredPrompts = useMemo\(\(\) => \{\n\s*let list = prompts;\n\s*if \(activeFolder === "favorites"\) \{\n\s*list = list\.filter\(\(p\) => p\.favorite\);\n\s*\} else if \(activeFolder\) \{\n\s*list = list\.filter\(\(p\) => p\.folder === activeFolder\);\n\s*\}\n\s*if \(searchQuery\) \{/g, filterLogic);

fs.writeFileSync('src/App.tsx', code);
