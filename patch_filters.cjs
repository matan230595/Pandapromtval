const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const filteredPrompts = useMemo\(\(\) => \{[\s\S]*?\}\);/m;

const replacement = `const filteredPrompts = useMemo(() => {
    let list = prompts;
    if (tagFilter !== 'all') {
      list = list.filter(p => p.tags && p.tags.includes(tagFilter));
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.folder !== "community") && // exclude community from general search
        (p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.toLowerCase().includes(q))))
      );
    } else {
      if (selectedFolder === "favorites") {
        list = list.filter(p => p.favorite && p.folder !== "archive" && p.folder !== "community");
      } else if (selectedFolder === "archive") {
        list = list.filter(p => p.folder === "archive");
      } else if (selectedFolder === "community") {
        list = list.filter(p => p.folder === "community");
      } else if (selectedFolder === "all") {
        list = list.filter(p => p.folder !== "archive" && p.folder !== "community");
      } else {
        list = list.filter(p => p.folder === selectedFolder);
      }
    }
    
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [prompts, selectedFolder, searchQuery, tagFilter]);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
