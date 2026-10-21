const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add States
const statesStr = `
  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [isMagicSuggesting, setIsMagicSuggesting] = useState(false);
  const [magicSuggestions, setMagicSuggestions] = useState<any>(null);
`;
code = code.replace(
  'const [searchQuery, setSearchQuery] = useState("");',
  'const [searchQuery, setSearchQuery] = useState("");\n' + statesStr
);

// 2. Add Handlers (before handleSave)
const handlersStr = `
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

  const handleMagicSuggest = async () => {
    if (!editingPrompt.content?.trim()) return;
    setIsMagicSuggesting(true);
    try {
      const res = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // assuming isRtl is not defined, we'll just check if it contains hebrew chars
        body: JSON.stringify({ content: editingPrompt.content, language: /[\\u0590-\\u05FF]/.test(editingPrompt.content || '') ? 'he' : 'en' })
      });
      if (res.ok) {
        const data = await res.json();
        setMagicSuggestions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMagicSuggesting(false);
    }
  };
`;

code = code.replace(
  'const handleSave = async (promptData: Partial<Prompt>) => {',
  handlersStr + '\n  const handleSave = async (promptData: Partial<Prompt>) => {'
);

fs.writeFileSync('src/App.tsx', code);
