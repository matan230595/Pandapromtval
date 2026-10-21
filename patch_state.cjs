const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [searchQuery, setSearchQuery] = useState("");',
  'const [searchQuery, setSearchQuery] = useState("");\n  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);\n  const [isSemanticSearching, setIsSemanticSearching] = useState(false);'
);

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

fs.writeFileSync('src/App.tsx', code);
