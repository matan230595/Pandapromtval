const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// State
code = code.replace(
  'const [searchQuery, setSearchQuery] = useState("");',
  'const [searchQuery, setSearchQuery] = useState("");\n  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);\n  const [isSemanticSearching, setIsSemanticSearching] = useState(false);'
);

// handleSemanticSearch method
const searchMethod = `
  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSemanticSearching(true);
    try {
      const simplifiedPrompts = prompts.map(p => ({id: p.id, title: p.title, tags: p.tags}));
      const res = await fetch("/api/gemini/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, prompts: simplifiedPrompts })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          setSemanticResults(data.results);
        }
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsSemanticSearching(false);
    }
  };
`;
code = code.replace(
  'const handleDownloadDB = () => {',
  searchMethod + '\n  const handleDownloadDB = () => {'
);

// filteredPrompts
const filteredPromptsNew = `
  const filteredPrompts = useMemo(() => {
    let list = prompts;
    if (tagFilter !== 'all') {
      list = list.filter(p => p.tags && p.tags.includes(tagFilter));
    }
    
    if (semanticResults !== null) {
      // If we have semantic results, ONLY show those IDs, ordered by the array
      const idMap = new Map();
      semanticResults.forEach((id, idx) => idMap.set(id, idx));
      list = list.filter(p => idMap.has(p.id))
                 .sort((a, b) => idMap.get(a.id) - idMap.get(b.id));
    } else if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.folder !== "community") && // exclude community from general search
        ((p.title || "").toLowerCase().includes(q) || (p.content || "").toLowerCase().includes(q) || (p.tags && p.tags.some(t => (t || "").toLowerCase().includes(q))))
      );
    } else {
`;
code = code.replace(
  /const filteredPrompts = useMemo\(\(\) => \{\s*let list = prompts;\s*if \(tagFilter !== 'all'\) \{\s*list = list\.filter\(p => p\.tags && p\.tags\.includes\(tagFilter\)\);\s*\}\s*if \(searchQuery\) \{/s,
  filteredPromptsNew.trim() + ' if (searchQuery) {' // keep the rest of the block by not breaking the else structure? No wait.
);

// Better replacement for filteredPrompts
// I will just read the file, split by filteredPrompts = useMemo, find the end of the block, replace the whole thing.
