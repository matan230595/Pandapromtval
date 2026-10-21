const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateStr = `const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);`;

code = code.replace(
  'const [searchQuery, setSearchQuery] = useState("");',
  'const [searchQuery, setSearchQuery] = useState("");\n  ' + stateStr
);

// clear semantic results when search query is cleared
code = code.replace(
  /onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}/,
  `onChange={(e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") setSemanticResults(null);
  }}`
);

const handleSearchStr = `
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
        setSemanticResults(data.results);
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
  handleSearchStr + '\n  const handleDownloadDB = () => {'
);

const filteredPromptsStr = `const filteredPrompts = prompts
    .filter((prompt) => {
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFolder = selectedFolder === "all" || prompt.folder === selectedFolder;
      const matchesTag = tagFilter === "all" || prompt.tags.includes(tagFilter);
      return matchesSearch && matchesFolder && matchesTag;
    })
    .sort((a, b) => {
      // Sort logic
      // We will handle semantic results filtering here
`;

// I need to intercept the filteredPrompts logic to show semantic results if they exist.
