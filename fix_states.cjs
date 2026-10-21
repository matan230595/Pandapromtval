const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will just remove all semanticResults/isSemanticSearching/isMagicSuggesting from lines 250-270 and insert them once cleanly.
// Let's use regex to remove them first.
code = code.replace(/const \[semanticResults, setSemanticResults\] = useState<string\[\] \| null>\(null\);\s*/g, '');
code = code.replace(/const \[isSemanticSearching, setIsSemanticSearching\] = useState\(false\);\s*/g, '');
code = code.replace(/const \[isMagicSuggesting, setIsMagicSuggesting\] = useState\(false\);\s*/g, '');
code = code.replace(/const \[magicSuggestions, setMagicSuggestions\] = useState<any>\(null\);\s*/g, '');

const correctState = `
  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [isMagicSuggesting, setIsMagicSuggesting] = useState(false);
  const [magicSuggestions, setMagicSuggestions] = useState<any>(null);
`;

code = code.replace(
  'const [searchQuery, setSearchQuery] = useState("");',
  'const [searchQuery, setSearchQuery] = useState("");' + correctState
);

fs.writeFileSync('src/App.tsx', code);
